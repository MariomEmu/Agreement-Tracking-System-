from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User

class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('email', 'full_name', 'department', 'role', 
                 'is_staff', 'is_superuser', 'is_admin')

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('email', 'full_name', 'department', 'role', 
                 'is_staff', 'is_superuser', 'is_admin')