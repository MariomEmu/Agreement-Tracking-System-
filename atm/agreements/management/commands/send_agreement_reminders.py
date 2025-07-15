from django.core.management.base import BaseCommand
from django.utils import timezone
from agreements.models import Agreement
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sends reminders for agreements whose reminder date is today'

    def handle(self, *args, **options):
        today = timezone.now().date()
        agreements = Agreement.objects.filter(
            reminder_time=today,
            status='ongoing'
        ).select_related('department', 'party_name', 'creator')
        
        sent_count = 0
        
        for agreement in agreements:
            if agreement.send_reminder_email():
                sent_count += 1
                logger.info(f"Sent reminder for agreement {agreement.id}")
        
        logger.info(f"Successfully sent {sent_count} reminders")
        self.stdout.write(self.style.SUCCESS(f"Sent {sent_count} reminders"))