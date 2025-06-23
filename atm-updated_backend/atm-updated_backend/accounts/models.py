from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from django.utils import timezone
from django.core.exceptions import ValidationError


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class Department(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    executive = models.BooleanField(default=False, help_text="If checked, users in this department can view all agreements but cannot create or edit them")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.id:  # Only set created_at on creation
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

class Role(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    username = None
    email = models.EmailField(_('email address'), unique=True)
    full_name = models.CharField(_('full name'), max_length=150, default='')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='users')
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    is_admin = models.BooleanField(default=False)

    # Remove first_name and last_name fields
    first_name = None
    last_name = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'department']

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        # If this is a new user and full_name is empty, raise validation error
        if not self.pk and not self.full_name:
            raise ValidationError({'full_name': 'Full name is required for new users.'})
        super().save(*args, **kwargs)

    def is_executive(self):
        """Check if the user belongs to an executive department"""
        return self.department and self.department.executive

class DepartmentPermission(models.Model):
    PERMISSION_CHOICES = [
        ('view', 'View Only'),
        ('edit', 'Create/Edit'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='department_permissions')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='permitted_users')
    permission_type = models.CharField(max_length=4, choices=PERMISSION_CHOICES)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='approved_permissions')
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'department', 'permission_type')
        verbose_name = 'Department Permission'
        verbose_name_plural = 'Department Permissions'

    def __str__(self):
        return f"{self.user.email} - {self.department.name} ({self.permission_type})"

    def clean(self):
        if self.approved_by and not self.approved_by.is_executive():
            raise ValidationError({'approved_by': 'Only executives can approve permissions.'})

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    phone_number = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ],
        blank=True
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.user.email

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.id:  # Only set created_at on creation
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)