from django.db import migrations

def clean_duplicate_references(apps, schema_editor):
    Agreement = apps.get_model('agreements', 'Agreement')
    
    # Find all duplicate references
    from django.db.models import Count
    duplicates = Agreement.objects.values('agreement_reference') \
        .annotate(count=Count('id')) \
        .filter(count__gt=1, agreement_reference__isnull=False)
    
    # Make duplicates unique by adding suffixes
    for dup in duplicates:
        ref = dup['agreement_reference']
        agreements = Agreement.objects.filter(agreement_reference=ref).order_by('id')
        for i, agreement in enumerate(agreements[1:], start=1):
            agreement.agreement_reference = f"{ref}-dup{i}"
            agreement.save()

class Migration(migrations.Migration):
    dependencies = [
        ('agreements', '0006_alter_agreement_options_and_more'),
    ]

    operations = [
        migrations.RunPython(clean_duplicate_references),
        migrations.RemoveConstraint(
            model_name='agreement',
            name='unique_agreement_reference',
        ),
    ]