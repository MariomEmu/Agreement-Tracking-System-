from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('agreements', '0007_remove_agreement_unique_agreement_reference'),
    ]

    operations = [
        migrations.AlterField(
            model_name='agreement',
            name='agreement_reference',
            field=models.CharField(max_length=100, blank=True, null=True, unique=True),
        ),
    ]