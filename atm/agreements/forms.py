from django import forms
from .models import Agreement
from accounts.models import Department, DepartmentPermission, User, Vendor
from django.db import models
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)

class AgreementForm(forms.ModelForm):
    agreement_type = forms.ModelChoiceField(
        queryset=Department.objects.none(),  # Will be populated in __init__
        required=True,
        widget=forms.Select(attrs={'class': 'form-control'}),
        label='Department'
    )
    party_name = forms.ModelChoiceField(
        queryset=Vendor.objects.all(),
        required=True,
        widget=forms.Select(attrs={'class': 'form-control'}),
        label='Party Name',
        empty_label='Select Vendor'
    )

    class Meta:
        model = Agreement
        fields = ['title', 'agreement_reference', 'agreement_type', 'party_name', 
                 'start_date', 'expiry_date', 'reminder_time', 'status', 'attachment']
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'expiry_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'reminder_time': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'agreement_reference': forms.TextInput(attrs={'class': 'form-control'}),
            'title': forms.TextInput(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Add a read-only field for agreement_id if instance exists
        if self.instance and getattr(self.instance, 'agreement_id', None):
            self.fields['agreement_id'] = forms.CharField(
                label='Agreement ID',
                initial=self.instance.agreement_id,
                required=False,
                disabled=True,
                widget=forms.TextInput(attrs={'class': 'form-control'})
            )
        
        # Set initial value for party_name if editing
        if self.instance and self.instance.pk and self.instance.party_name:
            try:
                vendor = Vendor.objects.get(name=self.instance.party_name)
                self.fields['party_name'].initial = vendor.pk
            except Vendor.DoesNotExist:
                pass
        
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
            
            # Update the queryset for agreement_type
            self.fields['agreement_type'].queryset = Department.objects.filter(id__in=department_ids)
            
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

        # Set default reminder_time if not set but expiry_date is available
        reminder_field = self.fields.get('reminder_time')
        if reminder_field:
            reminder_value = self.initial.get('reminder_time') or getattr(self.instance, 'reminder_time', None)
            expiry_value = self.initial.get('expiry_date') or getattr(self.instance, 'expiry_date', None)
            if not reminder_value and expiry_value:
                try:
                    reminder_field.initial = expiry_value - timedelta(days=180)
                except Exception:
                    pass

    def clean(self):
        cleaned_data = super().clean()
        delete_flag = self.data.get('delete_attachment') == '1' if hasattr(self, 'data') else False
        if delete_flag:
            cleaned_data['attachment'] = None
            # If deleting, require a new file
            if not self.files.get('attachment'):
                self.add_error('attachment', 'Please upload a new file after deleting the current one.')
        
        # Validate date relationships
        start_date = cleaned_data.get('start_date')
        expiry_date = cleaned_data.get('expiry_date')
        reminder_time = cleaned_data.get('reminder_time')
        
        if start_date and reminder_time and reminder_time <= start_date:
            self.add_error('reminder_time', 'Error: Reminder date must be after the start date. Please select a date that falls between the start date and expiry date.')
        
        if reminder_time and expiry_date and reminder_time >= expiry_date:
            self.add_error('reminder_time', 'Error: Reminder date must be before the expiry date. The reminder should be set before the agreement expires.')
        
        return cleaned_data

    def get_assigned_users(self, department_id):
        """Get users who will have access to this agreement, including all executives"""
        # Users in this department or with permissions
        base_users = User.objects.filter(
            models.Q(department_id=department_id) |
            models.Q(department_permissions__department_id=department_id)
        )
        # All users in executive departments
        executive_users = User.objects.filter(department__executive=True)
        # Union and distinct
        return base_users.union(executive_users).distinct()

    def save(self, commit=True):
        instance = super().save(commit=False)
        
        # Handle attachment deletion
        delete_flag = self.data.get('delete_attachment') == '1' if hasattr(self, 'data') else False
        if delete_flag and instance.attachment:
            instance.attachment.delete(save=False)
            instance.attachment = None
        
        # Set department from agreement_type
        if self.cleaned_data.get('agreement_type'):
            instance.department = self.cleaned_data['agreement_type']
        
        if commit:
            instance.save()
            # Get users who should be assigned
            if self.cleaned_data.get('agreement_type'):
                department_id = self.cleaned_data['agreement_type'].id
                users_with_permissions = self.get_assigned_users(department_id)
                instance.assigned_users.set(users_with_permissions)
        
        return instance