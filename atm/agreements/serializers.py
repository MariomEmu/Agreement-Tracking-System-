from rest_framework import serializers
from .models import Agreement, AgreementType  # Add AgreementType to imports
from accounts.models import User, Vendor, Department

class AgreementTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgreementType
        fields = ['id', 'name', 'description', 'is_active']

class AgreementSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    agreement_type_name = serializers.CharField(source='agreement_type.name', read_only=True)
    agreement_type_detail = AgreementTypeSerializer(source='agreement_type', read_only=True)
    party_name_display = serializers.CharField(source='party_name.name', read_only=True)
    assigned_users = serializers.SerializerMethodField()
    original_filename = serializers.CharField(read_only=True)
    creator_name = serializers.CharField(source='creator.full_name', read_only=True)
    executive_users = serializers.SerializerMethodField()

    def get_assigned_users(self, obj):
        return [user.full_name for user in obj.assigned_users.all()]
    
    def get_executive_users(self, obj):
        executives = User.objects.filter(department__executive=True)
        return [
            {
                'id': user.id,
                'full_name': user.full_name,
                'department__name': user.department.name if user.department else ''
            }
            for user in executives
        ]

    class Meta:
        model = Agreement
        fields = [
            'id', 'title', 'agreement_reference', 'agreement_type', 'agreement_type_name', 'agreement_type_detail',
            'status', 'start_date', 'expiry_date', 'reminder_time', 'remarks',
            'party_name', 'party_name_display', 'attachment', 'original_filename','created_at', 'updated_at',
            'agreement_id', 'assigned_users', 'department', 'department_name', 'creator', 'creator_name', 'executive_users'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'agreement_id', 'assigned_users', 'department', 'creator', 'creator_name']

    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        # Department must be set explicitly; do not assign agreement_type to department
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Department must be set explicitly; do not assign agreement_type to department
        return super().update(instance, validated_data)