# accounts/serializers.py
from rest_framework import serializers
from .models import DepartmentPermission, User, Department, Role, Vendor

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class DepartmentPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentPermission
        fields = '__all__'

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['id', 'name']        
