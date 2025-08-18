from rest_framework.permissions import BasePermission

class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser

    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser

class HasDepartmentPermission(BasePermission):
    def __init__(self, permission_type='view'):
        self.permission_type = permission_type

    def has_permission(self, request, view):
        # Superusers can do anything
        if request.user.is_superuser:
            return True

        # Get the department from the view
        department = getattr(view, 'department', None)
        if not department:
            return False

        # Check if user has the required permission for this department
        return request.user.department_permissions.filter(
            department=department,
            permission_type=self.permission_type
        ).exists()

    def has_object_permission(self, request, view, obj):
        # Superusers can do anything
        if request.user.is_superuser:
            return True

        # Get the department from the object
        department = getattr(obj, 'department', None)
        if not department:
            return False

        # Check if user has the required permission for this department
        return request.user.department_permissions.filter(
            department=department,
            permission_type=self.permission_type
        ).exists()