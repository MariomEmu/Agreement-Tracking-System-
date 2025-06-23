from django.contrib import admin
from .models import Agreement

@admin.register(Agreement)
class AgreementAdmin(admin.ModelAdmin):
    list_display = ('title', 'get_department_name', 'status', 'start_date', 'expiry_date', 'party_name', 'get_creator')
    list_filter = ('status', 'department', 'created_at')
    search_fields = ('title', 'party_name', 'creator__email')
    date_hierarchy = 'created_at'
    filter_horizontal = ('assigned_users',)
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else '-'
    get_department_name.short_description = 'Agreement Type'
    
    def get_creator(self, obj):
        return obj.creator.email if obj.creator else '-'
    get_creator.short_description = 'Created By'
