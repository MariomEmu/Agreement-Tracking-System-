from django.db import models
from django.conf import settings
from datetime import datetime, timedelta
from accounts.models import Department, Vendor
from django.core.exceptions import ValidationError
import os
import uuid
from django.db import transaction, IntegrityError
import logging
from django.utils import timezone
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

def agreement_file_path(instance, filename):
    """Generate file path for agreement attachments"""
    ext = os.path.splitext(filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    return os.path.join('agreements', str(instance.agreement_type.id), filename)

class AgreementType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_agreement_types'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name = 'Agreement Type'
        verbose_name_plural = 'Agreement Types'


class Agreement(models.Model):
    AGREEMENT_STATUS = (
        ('ongoing', 'Ongoing'),
        ('expired', 'Expired'),
        ('draft', 'Draft'),
        ('terminated', 'Terminated'),
    )
    
    title = models.CharField(max_length=200)
    agreement_type = models.ForeignKey(
        AgreementType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Type of Agreement'
    )
    remarks = models.TextField(
        blank=True,
        null=True,
        verbose_name='Additional Remarks'
    )
    status = models.CharField(
        max_length=15, 
        choices=AGREEMENT_STATUS, 
        default='ongoing'  # Changed from 'draft' to 'ongoing'
    )
    start_date = models.DateField()
    expiry_date = models.DateField()
    party_name = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name='agreements',
        verbose_name='Vendor'
    )
    reminder_time = models.DateField(
        help_text="Date when reminders should be sent"
    )
    assigned_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='assigned_agreements',
        blank=True
    )
    attachment = models.FileField(
        upload_to=agreement_file_path,
        max_length=255,
        blank=True,
        null=True
    )
    original_filename = models.CharField(max_length=255, blank=True, null=True)  # <-- Add this
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_agreements'
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='department_agreements'
    )
    agreement_id = models.CharField(
        max_length=20, 
        unique=True, 
        editable=False, 
        blank=True
    )
    agreement_reference = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        #unique=True  # Remove if you need to allow duplicates
    )

    def clean(self):
        super().clean()
        
        # Validate date relationships
        if self.start_date and self.expiry_date:
            if self.expiry_date <= self.start_date:
                raise ValidationError(
                    {'expiry_date': 'Expiry date must be after start date.'}
                )
            
            if not self.reminder_time:
                self.reminder_time = self.expiry_date - timedelta(days=180)
            
            if self.reminder_time <= self.start_date:
                raise ValidationError(
                    {'reminder_time': 'Reminder must be after start date.'}
                )
                
            if self.reminder_time >= self.expiry_date:
                raise ValidationError(
                    {'reminder_time': 'Reminder must be before expiry date.'}
                )

    def save(self, *args, **kwargs):
    # Department must be set explicitly; do not assign agreement_type to department
            
        # Auto-generate agreement_id if new record
        if not self.pk and not self.agreement_id:
            with transaction.atomic():
                year = datetime.now().year
                try:
                    # Get the maximum existing ID number for this year
                    max_id = Agreement.objects.filter(
                        agreement_id__startswith=f"A_{year}_",
                        agreement_id__regex=r'^A_\d{4}_\d{4}$'  # Ensure proper format
                    ).order_by('-agreement_id').first()
                    
                    if max_id:
                        last_num = int(max_id.agreement_id.split('_')[-1])
                        count = last_num + 1
                    else:
                        count = 1
                        
                    self.agreement_id = f"A_{year}_{count:04d}"
                    
                    # Verify this ID doesn't already exist (final safety check)
                    if Agreement.objects.filter(agreement_id=self.agreement_id).exists():
                        raise IntegrityError(f"Duplicate ID generated: {self.agreement_id}")
                        
                except (ValueError, IndexError) as e:
                    logger.error(f"Error parsing agreement ID: {e}")
                    # Fallback to UUID if ID parsing fails
                    self.agreement_id = f"A_{year}_{uuid.uuid4().hex[:4]}"
            
        # Set default reminder if not set
        if not self.reminder_time and self.expiry_date:
            self.reminder_time = self.expiry_date - timedelta(days=180)
            
        # If a new file is uploaded, set the original filename
        if self.attachment and hasattr(self.attachment, 'file'):
            # Only set if the file is new or changed
            if not self.pk or not Agreement.objects.filter(pk=self.pk, attachment=self.attachment.name).exists():
                # Use the uploaded file's original name
                self.original_filename = self.attachment.file.name
        
        # Auto-manage status based on expiry date
        if self.expiry_date:
            today = timezone.now().date()
            if self.expiry_date < today:
                self.status = 'expired'
            elif self.status == 'expired' and self.expiry_date >= today:
                # If status was expired but date is now in future, set back to ongoing
                self.status = 'ongoing'
        
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Delete associated files when agreement is deleted"""
        if self.attachment:
            self.attachment.delete(save=False)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.agreement_id} - {self.title}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Agreement'
        verbose_name_plural = 'Agreements'

    def send_notification(self, user, reminder_type='before'):
        """Send reminder email for this agreement"""
        from .utils.email_utils import send_agreement_reminder
        from accounts.models import User
        # Ensure user is a User instance
        if isinstance(user, str) or isinstance(user, int):
            try:
                user = User.objects.get(pk=user)
            except User.DoesNotExist:
                return False
        return send_agreement_reminder(self, user, reminder_type)

    def send_reminder(self, recipient):
        """Send reminder email for this agreement"""
        from django.core.mail import send_mail
        from django.conf import settings
        
        subject = f"Reminder: {self.title} (Expires: {self.expiry_date})"
        message = f"""
        Agreement Reminder:
        Title: {self.title}
        Reference: {self.agreement_reference}
        Expiry Date: {self.expiry_date}
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient.email],
            fail_silently=False,
        )
        return True

    def get_users_to_notify(self):
        """
        Get all users who should receive notifications for this agreement.
        Includes all assigned users and the creator (if not already included).
        """
        users = list(self.assigned_users.all())
        if self.creator and self.creator not in users:
            users.append(self.creator)
        return users

def send_notification(self, action):
    """Send notification about agreement action to all assigned users"""
    from agreements.utils.email_utils import send_agreement_notification
    recipients = list(self.get_users_to_notify().values_list('email', flat=True))
    if recipients:
        send_agreement_notification(self, action, recipients)


# Add this method to your existing Agreement model
def send_reminder_email(self):
    """Send reminder to all assigned users (or creator if no users assigned)"""
    from django.core.mail import send_mail
    from django.conf import settings
    from django.utils import timezone
    
    # Get recipients
    recipients = list(self.assigned_users.values_list('email', flat=True))
    if not recipients and self.creator.email:
        recipients = [self.creator.email]
    
    if not recipients:
        return False

    # Prepare email
    subject = f"Reminder: {self.title} (Expires: {self.expiry_date})"
    message = f"""
    Agreement Reminder:
    
    Title: {self.title}
    Department: {self.department.name if self.department else 'N/A'}
    Vendor: {self.party_name.name if self.party_name else 'N/A'}
    Start Date: {self.start_date}
    Expiry Date: {self.expiry_date}
    Days Remaining: {(self.expiry_date - timezone.now().date()).days}
    
    Please take necessary action before expiration.
    """
    
    # Send email
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipients,
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send reminder for agreement {self.id}: {str(e)}")
        return False