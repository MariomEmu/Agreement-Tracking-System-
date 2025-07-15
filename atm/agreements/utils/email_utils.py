import logging
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

def send_agreement_reminder(agreement, user):
    """
    Send reminder email for an agreement to a specific user
    """
    try:
        subject = f"Reminder: {agreement.title} (Expires on {agreement.expiry_date})"
        
        days_remaining = (agreement.expiry_date - timezone.now().date()).days
        context = {
            'agreement': agreement,
            'user': user,
            'days_remaining': days_remaining,
            'vendor_name': agreement.party_name.name if agreement.party_name else '',
            'department_name': agreement.agreement_type.name if agreement.agreement_type else ''
        }
        
        message = render_to_string('emails/agreement_reminder.txt', context)
        html_message = render_to_string('emails/agreement_reminder.html', context)
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
            html_message=html_message
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send reminder for agreement {agreement.id} to {user.email}: {str(e)}")
        return False

def send_agreement_notification(agreement, action, recipients):
    """
    Send notification about agreement creation/update
    """
    try:
        subject = f"Agreement {action}: {agreement.title}"
        
        context = {
            'agreement': agreement,
            'action': action,
            'agreement_reference': agreement.agreement_reference,
            'start_date': agreement.start_date,
            'expiry_date': agreement.expiry_date,
            'reminder_date': agreement.reminder_time,
            'vendor_name': agreement.party_name.name if agreement.party_name else '',
            'department_name': agreement.agreement_type.name if agreement.agreement_type else ''
        }
        
        message = render_to_string('emails/agreement_notification.txt', context)
        html_message = render_to_string('emails/agreement_notification.html', context)
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
            fail_silently=False,
            html_message=html_message
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send {action} notification for agreement {agreement.id}: {str(e)}")
        return False