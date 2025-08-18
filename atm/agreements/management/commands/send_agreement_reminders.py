from django.core.management.base import BaseCommand
from django.utils import timezone
from agreements.models import Agreement
from agreements.utils.email_utils import send_agreement_reminder
# If you get an import error, install with: pip install python-dateutil
try:
    from dateutil.relativedelta import relativedelta
except ImportError:
    raise ImportError('Please install python-dateutil: pip install python-dateutil')
import logging

logger = logging.getLogger(__name__)

REMINDER_INTERVALS = [6, 3, 2, 1]  # months before
REMINDER_WEEK = 7  # days before

class Command(BaseCommand):
    help = 'Sends reminders for agreements at multiple intervals before, on, and after expiration.'

    def handle(self, *args, **options):
        today = timezone.now().date()
        agreements = Agreement.objects.filter(status='ongoing').select_related('department', 'party_name', 'creator')
        sent_count = 0
        after_expiry_sent_count = 0

        for agreement in agreements:
            expiry = agreement.expiry_date
            # Before expiration: months
            for months in REMINDER_INTERVALS:
                reminder_date = expiry - relativedelta(months=months)
                if today == reminder_date:
                    for user in agreement.get_users_to_notify():
                        if send_agreement_reminder(
                            agreement, user, 'before',
                            time_remaining=f'{months} month(s)'):
                            sent_count += 1
                    if agreement.creator and agreement.creator.email:
                        if send_agreement_reminder(
                            agreement, agreement.creator, 'before',
                            time_remaining=f'{months} month(s)'):
                            sent_count += 1
            # Before expiration: 1 week
            week_reminder_date = expiry - timezone.timedelta(days=REMINDER_WEEK)
            if today == week_reminder_date:
                for user in agreement.get_users_to_notify():
                    if send_agreement_reminder(
                        agreement, user, 'before',
                        time_remaining='1 week'):
                        sent_count += 1
                if agreement.creator and agreement.creator.email:
                    if send_agreement_reminder(
                        agreement, agreement.creator, 'before',
                        time_remaining='1 week'):
                        sent_count += 1
            # On expiration date
            if today == expiry:
                for user in agreement.get_users_to_notify():
                    if send_agreement_reminder(
                        agreement, user, 'on'):
                        sent_count += 1
                if agreement.creator and agreement.creator.email:
                    if send_agreement_reminder(
                        agreement, agreement.creator, 'on'):
                        sent_count += 1
            # After expiration: every month
            if today > expiry:
                months_since = (today.year - expiry.year) * 12 + (today.month - expiry.month)
                # Only send on the monthly anniversary of expiration
                if expiry.day == today.day:
                    for user in agreement.get_users_to_notify():
                        if send_agreement_reminder(
                            agreement, user, 'after',
                            months_since_expiration=months_since):
                            after_expiry_sent_count += 1
                    if agreement.creator and agreement.creator.email:
                        if send_agreement_reminder(
                            agreement, agreement.creator, 'after',
                            months_since_expiration=months_since):
                            after_expiry_sent_count += 1
        logger.info(f"Sent {sent_count} reminders (before/on), {after_expiry_sent_count} after-expiry reminders.")
        self.stdout.write(self.style.SUCCESS(f"Sent {sent_count} reminders (before/on), {after_expiry_sent_count} after-expiry reminders."))