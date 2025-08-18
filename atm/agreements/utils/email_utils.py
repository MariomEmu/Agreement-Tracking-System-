import logging
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from dateutil.relativedelta import relativedelta

logger = logging.getLogger(__name__)

def send_agreement_reminder(agreement, user, reminder_type, months_since_expiration=None, time_remaining=None):
    """
    Send event-based reminder email for an agreement to a specific user.
    reminder_type: 'before', 'on', or 'after'
    """
    try:
        # Prepare context
        context = {
            'recipient_name': getattr(user, 'full_name', getattr(user, 'username', 'User')),
            'agreement_name': agreement.title,
            'partner_name': agreement.party_name.name if agreement.party_name else '',
            'expiration_date': agreement.expiry_date,
            'agreement_id': agreement.agreement_id,
            'company_name': getattr(settings, 'COMPANY_NAME', 'Your Company Name'),
            'support_contact': getattr(settings, 'SUPPORT_CONTACT', 'Support Email/Phone'),
            'reminder_type': reminder_type,
            'months_since_expiration': months_since_expiration,
            'time_remaining': time_remaining,
        }

        if reminder_type == 'before':
            subject = f"Reminder: Your agreement '{agreement.title}' expires on {agreement.expiry_date}"
        elif reminder_type == 'on':
            subject = f"Your agreement '{agreement.title}' has expired today ({agreement.expiry_date})"
        elif reminder_type == 'after':
            subject = f"Follow-up: Your agreement '{agreement.title}' expired on {agreement.expiry_date}"
        else:
            subject = f"Agreement Notification: {agreement.title}"

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
        logger.error(f"Failed to send {reminder_type} reminder for agreement {agreement.id} to {user.email}: {str(e)}")
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