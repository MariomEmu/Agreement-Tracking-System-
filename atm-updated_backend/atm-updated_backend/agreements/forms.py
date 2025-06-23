from django import forms
from .models import Agreement
from accounts.models import Department, DepartmentPermission, User
from django.db import models
import logging

logger = logging.getLogger(__name__)

class AgreementForm(forms.ModelForm):
    agreement_type = forms.ChoiceField(
        choices=[],  # Will be populated in __init__
        required=True,
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta:
        model = Agreement
        fields = ['title', 'agreement_type', 'status', 'start_date', 'expiry_date', 
                 'party_name', 'attachment']
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'expiry_date': forms.DateInput(attrs={'type': 'date'}),
        }

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        if self.user:
            # Get departments where user has edit permission
            department_ids = set()
            
            # Add user's own department if they have one
            if self.user.department:
                department_ids.add(self.user.department.id)
            
            # Add departments where user has edit permission
            permitted_dept_ids = DepartmentPermission.objects.filter(
                user=self.user,
                permission_type='edit'
            ).values_list('department_id', flat=True)
            department_ids.update(permitted_dept_ids)
            
            # Get all departments that user has access to
            permitted_departments = Department.objects.filter(id__in=department_ids)
            
            # Set the choices for agreement_type field to be the department names
            self.fields['agreement_type'].choices = [(dept.id, dept.name) for dept in permitted_departments]
            
            # Make attachment not required if:
            # 1. We're editing from preview and have an existing file
            # 2. We're editing an existing agreement (instance exists)
            # 3. Unless delete_attachment is set in POST (then required)
            delete_flag = self.data.get('delete_attachment') == '1' if hasattr(self, 'data') else False
            if (('edit_from_preview' in self.data and self.files.get('attachment')) or \
                (hasattr(self, 'instance') and self.instance and self.instance.attachment)) and not delete_flag:
                self.fields['attachment'].required = False
            else:
                self.fields['attachment'].required = True

    def clean(self):
        cleaned_data = super().clean()
        delete_flag = self.data.get('delete_attachment') == '1' if hasattr(self, 'data') else False
        if delete_flag:
            cleaned_data['attachment'] = None
            # If deleting, require a new file
            if not self.files.get('attachment'):
                self.add_error('attachment', 'Please upload a new file after deleting the current one.')
        return cleaned_data

    def get_assigned_users(self, department_id):
        """Get users who will have access to this agreement"""
        return User.objects.filter(
            models.Q(department_id=department_id) |  # Users in this department
            models.Q(department_permissions__department_id=department_id)  # Users with permissions
        ).distinct()

    def save(self, commit=True):
        instance = super().save(commit=False)
        # Handle attachment deletion
        delete_flag = self.data.get('delete_attachment') == '1' if hasattr(self, 'data') else False
        if delete_flag and instance.attachment:
            instance.attachment.delete(save=False)
            instance.attachment = None
        # Set the department based on the selected agreement_type
        department_id = self.cleaned_data.get('agreement_type')
        if department_id:
            try:
                instance.department_id = int(department_id)
            except (ValueError, TypeError):
                pass
            
            if commit:
                instance.save()
                # Get users who should be assigned
                users_with_permissions = self.get_assigned_users(department_id)
                instance.assigned_users.set(users_with_permissions)
        return instance 