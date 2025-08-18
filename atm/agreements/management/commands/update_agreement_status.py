from django.core.management.base import BaseCommand
from django.utils import timezone
from agreements.models import Agreement
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Automatically updates agreement statuses based on expiry dates'

    def handle(self, *args, **options):
        today = timezone.now().date()
        updated_count = 0
        
        # Update expired agreements
        expired_agreements = Agreement.objects.filter(
            status='ongoing',
            expiry_date__lt=today
        )
        expired_count = expired_agreements.update(status='expired')
        
        # Update agreements that are no longer expired (if dates were changed)
        ongoing_agreements = Agreement.objects.filter(
            status='expired',
            expiry_date__gte=today
        )
        ongoing_count = ongoing_agreements.update(status='ongoing')
        
        total_updated = expired_count + ongoing_count
        
        if total_updated > 0:
            logger.info(f"Updated {expired_count} agreements to expired, {ongoing_count} to ongoing")
            self.stdout.write(
                self.style.SUCCESS(
                    f"Updated {expired_count} agreements to expired, {ongoing_count} to ongoing"
                )
            )
        else:
            self.stdout.write("No agreement statuses needed updating")
