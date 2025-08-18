from django.contrib import admin
from .models import Agreement, AgreementType  # Add AgreementType to imports

@admin.register(AgreementType)
class AgreementTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_by', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    list_editable = ('is_active',)
    readonly_fields = ('created_at', 'updated_at')
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:  # Only set created_by during the first save
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(Agreement)
class AgreementAdmin(admin.ModelAdmin):
    list_display = (
        'agreement_id', 'agreement_reference', 'title', 
        'get_agreement_type', 'get_department_name', 'status', 
        'start_date', 'expiry_date', 'get_creator'
    )
    list_filter = ('status', 'department', 'agreement_type', 'created_at')
    search_fields = ('title', 'party_name', 'creator__email', 'remarks')
    date_hierarchy = 'created_at'
    filter_horizontal = ('assigned_users',)
    readonly_fields = ('status', 'agreement_id', 'created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'agreement_reference', 'agreement_type', 'remarks')
        }),
        ('Dates', {
            'fields': ('start_date', 'expiry_date', 'reminder_time')
        }),
        ('Parties', {
            'fields': ('party_name', 'department')
        }),
        ('Metadata', {
            'fields': ('status', 'attachment', 'assigned_users', 'creator', 'agreement_id')
        }),
    )
    
    def get_agreement_type(self, obj):
        return obj.agreement_type.name if obj.agreement_type else '-'
    get_agreement_type.short_description = 'Agreement Type'
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else '-'
    get_department_name.short_description = 'Department'
    
    def get_creator(self, obj):
        return obj.creator.email if obj.creator else '-'
    get_creator.short_description = 'Created By'