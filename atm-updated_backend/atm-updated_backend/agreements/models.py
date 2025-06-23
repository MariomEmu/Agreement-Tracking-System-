from django.db import models
from django.conf import settings
from datetime import datetime, timedelta
from accounts.models import Department

class Agreement(models.Model):
    AGREEMENT_STATUS = (
        ('ongoing', 'Ongoing'),
        ('expired', 'Expired'),
    )
    
    title = models.CharField(max_length=200)
    agreement_type = models.CharField(max_length=100)  # This will store the department ID
    status = models.CharField(max_length=10, choices=AGREEMENT_STATUS, default='ongoing')
    start_date = models.DateField()
    expiry_date = models.DateField()
    party_name = models.CharField(max_length=200)
    reminder_time = models.DateField(editable=False)  # Automatically set to 6 months before expiry
    assigned_users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='assigned_agreements')
    attachment = models.FileField(upload_to='agreements/', max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # New fields
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

    def save(self, *args, **kwargs):
        # Set reminder time to 6 months before expiry date
        if self.expiry_date:
            self.reminder_time = self.expiry_date - timedelta(days=180)
        
        # If this is a new agreement (no ID yet), set the department from the agreement_type
        if not self.pk and self.agreement_type:
            try:
                self.department_id = int(self.agreement_type)
            except (ValueError, TypeError):
                pass
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
