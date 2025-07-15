from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Department, Role, DepartmentPermission
from .models import Vendor

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('email', 'full_name', 'is_staff', 'is_admin', 'is_superuser', 'department', 'role')
    list_filter = ('is_staff', 'is_superuser', 'is_admin', 'department', 'role')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name',)}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_admin', 'groups', 'user_permissions'),
        }),
        ('Department Info', {'fields': ('department', 'role')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2', 'department',
                      'is_staff', 'is_superuser', 'is_admin', 'role'),
        }),
    )
    search_fields = ('email', 'full_name')
    ordering = ('email',)

class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'executive')
    list_filter = ('executive',)
    search_fields = ('name', 'description')

class DepartmentPermissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'permission_type', 'get_approved_by', 'granted_at')
    list_filter = ('permission_type', 'department')
    search_fields = ('user__email', 'department__name')
    readonly_fields = ('granted_at',)

    def get_approved_by(self, obj):
        if obj.approved_by:
            return obj.approved_by.full_name
        return '-'
    get_approved_by.short_description = 'Approved By'

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "approved_by":
            kwargs["queryset"] = User.objects.filter(department__executive=True)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        if not change:  # Only set approved_by when creating new permission
            if request.user.is_executive():
                obj.approved_by = request.user
            else:
                # Find an executive user to approve
                executive_user = User.objects.filter(department__executive=True).first()
                if executive_user:
                    obj.approved_by = executive_user
        super().save_model(request, obj, form, change)

    def has_change_permission(self, request, obj=None):
        if obj and obj.approved_by:
            return request.user.is_executive() or request.user.is_superuser
        return super().has_change_permission(request, obj)

admin.site.site_header = "Agreement Tracking Module"
admin.site.site_title = "Agreement Tracking Module"
admin.site.index_title = "Agreement Tracking Module"

admin.site.register(User, CustomUserAdmin)
admin.site.register(Department, DepartmentAdmin)
admin.site.register(Role)
admin.site.register(DepartmentPermission, DepartmentPermissionAdmin)
admin.site.register(Vendor)