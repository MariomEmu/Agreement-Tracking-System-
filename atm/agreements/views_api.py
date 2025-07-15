from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.views import APIView
from django.core.files.storage import default_storage
from django.core.files import File
from django.shortcuts import get_object_or_404
from django.db.models import Q
import os
import logging
from .models import Agreement
from .serializers import AgreementSerializer
from .forms import AgreementForm
from accounts.models import Department, User, DepartmentPermission, Vendor
from accounts.serializers import DepartmentSerializer
from django.core.files.base import ContentFile
from django.core.exceptions import PermissionDenied
from datetime import date, timedelta

from django.conf import settings
from django.core.mail import EmailMessage

logger = logging.getLogger(__name__)

class AgreementViewSet(viewsets.ModelViewSet):
    queryset = Agreement.objects.all()
    serializer_class = AgreementSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        agreement = serializer.save(creator=self.request.user)
        # Send notification to assigned users
        agreement.send_notification('created')

    def get_queryset(self):
        """Filter agreements based on user permissions"""
        user = self.request.user
        user_departments = [user.department] if user.department else []
        
        # Get departments where user has permissions through DepartmentPermission
        permitted_departments = Department.objects.filter(
            permitted_users__user=user
        ).distinct()
        user_departments.extend(permitted_departments)
        
        # Check if user is in an executive department
        is_executive = Department.objects.filter(
            executive=True,
            users=user
        ).exists()
        
        if is_executive:
            # Executive users can see all agreements
            return Agreement.objects.all().order_by('-created_at')
        else:
            # Regular users can only see agreements from their departments
            return Agreement.objects.filter(
                department__in=user_departments
            ).order_by('-created_at')

    @action(detail=False, methods=['get'], url_path='list')
    def agreement_list(self, request):
        """Get list of agreements with user permissions"""
        agreements = self.get_queryset()
        serializer = self.get_serializer(agreements, many=True)
        
        # Get departments for filtering
        departments = Department.objects.all()
        department_serializer = DepartmentSerializer(departments, many=True)
        
        return Response({
            'agreements': serializer.data,
            'departments': department_serializer.data
        })

    @action(detail=True, methods=['get'], url_path='detail')
    def agreement_detail(self, request, pk=None):
        """Get detailed information about a specific agreement"""
        agreement = self.get_object()
        
        # Check if user has access to this agreement
        user = request.user
        is_executive = Department.objects.filter(
            executive=True,
            users=user
        ).exists()
        
        if not is_executive:
            # Check if user has access to this agreement
            if not (user.department == agreement.department or 
                    DepartmentPermission.objects.filter(
                        user=user,
                        department=agreement.department
                    ).exists()):
                return Response({
                    'error': 'You do not have permission to view this agreement.'
                }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(agreement)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='form-data')
    def form_data(self, request):
        """Get form data for creating/editing agreements"""
        user = request.user
        
        # Check if user is in an executive department
        is_executive = Department.objects.filter(
            executive=True,
            users=user
        ).exists()
        
        if is_executive:
            return Response({
                'error': 'Executive users cannot create agreements.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get user's departments and permitted departments
        department_ids = set()
        if user.department:
            department_ids.add(user.department.id)
        
        permitted_dept_ids = DepartmentPermission.objects.filter(
            user=user,
            permission_type='edit'
        ).values_list('department_id', flat=True)
        department_ids.update(permitted_dept_ids)
        
        permitted_departments = Department.objects.filter(id__in=department_ids)
        department_serializer = DepartmentSerializer(permitted_departments, many=True)
        
        return Response({
            'departments': department_serializer.data,
            'user_info': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'department': {
                    'id': user.department.id,
                    'name': user.department.name
                } if user.department else None
            }
        })

    @action(detail=True, methods=['put', 'patch'], url_path='edit')
    def edit_agreement(self, request, pk=None):
        """Edit an existing agreement"""
        agreement = self.get_object()
        user = request.user
        
        # Check if user is in an executive department
        is_executive = Department.objects.filter(
            executive=True,
            users=user
        ).exists()
        
        if is_executive:
            return Response({
                'error': 'Executive users cannot edit agreements.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user has permission to edit
        has_permission = (
            user in agreement.assigned_users.all() or
            (hasattr(user, 'department') and user.department == agreement.department) or
            DepartmentPermission.objects.filter(
                user=user,
                department=agreement.department,
                permission_type='edit'
            ).exists()
        )
        
        if not has_permission:
            return Response({
                'error': 'You do not have permission to edit this agreement.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Handle file uploads
        if 'attachment' in request.FILES:
            # Handle new file upload
            pass
        
        serializer = self.get_serializer(agreement, data=request.data, partial=True)
        if serializer.is_valid():
            updated_agreement = serializer.save()
            # Send notification to assigned users
            updated_agreement.send_notification('updated')
            return Response({
                'success': True,
                'message': 'Agreement updated successfully!',
                'agreement': serializer.data
            })
        else:
            return Response({
                'success': False,
                'message': 'Please correct the errors below.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='submit')
    def submit_agreement(self, request):
        """
        Submit agreement from preview - handles file uploads and form validation
        """
        try:
            # Create a mutable copy of POST data
            post_data = request.data.copy()
            temp_file = None
            temp_path = None
            
            try:
                # If there's a temporary file path, get the file
                if 'attachment_path' in request.data:
                    temp_path = request.data['attachment_path']
                    if default_storage.exists(temp_path):
                        # Get the file from storage
                        temp_file = default_storage.open(temp_path)
                        # Create a new file object
                        file_obj = File(temp_file, name=os.path.basename(temp_path))
                        # Add to FILES
                        request.FILES['attachment'] = file_obj
                
                form = AgreementForm(post_data, request.FILES, user=request.user)
                if form.is_valid():
                    agreement = form.save(commit=False)
                    agreement.creator = request.user
                    agreement.save()
                    form.save_m2m()  # Save many-to-many relationships
                    
                    # Send notification to assigned users
                    agreement.send_notification('created')
                    
                    # Clear the preview form data from session if it exists
                    if 'preview_form_data' in request.session:
                        del request.session['preview_form_data']
                    
                    return Response({
                        'success': True,
                        'message': 'Agreement created successfully!',
                        'agreement_id': agreement.id
                    }, status=status.HTTP_201_CREATED)
                else:
                    return Response({
                        'success': False,
                        'message': 'Please correct the errors below.',
                        'errors': form.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
            finally:
                # Clean up temporary file if it exists
                if temp_file:
                    temp_file.close()
                if temp_path and default_storage.exists(temp_path):
                    try:
                        default_storage.delete(temp_path)
                    except PermissionError:
                        # If we can't delete now, we'll leave it for the next cleanup
                        pass
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error creating agreement: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Individual API Views that match the URL patterns
class AgreementListAPIView(APIView):
    """API view for agreement list - matches path('', views.agreement_list)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get list of agreements with user permissions"""
        user = request.user
        user_departments = [user.department] if user.department else []
        
        # Get departments where user has permissions through DepartmentPermission
        permitted_departments = Department.objects.filter(
            permitted_users__user=user
        ).distinct()
        user_departments.extend(permitted_departments)
        
        # Check if user is in an executive department
        is_executive = Department.objects.filter(
            executive=True,
            users=user
        ).exists()
        
        if is_executive:
            # Executive users can see all agreements
            agreements = Agreement.objects.all()
        else:
            # Regular users can only see agreements from their departments
            agreements = Agreement.objects.filter(
                department__in=user_departments
            )
        
        agreements = agreements.order_by('-created_at')
        departments = Department.objects.all()
        
        agreement_serializer = AgreementSerializer(agreements, many=True)
        department_serializer = DepartmentSerializer(departments, many=True)
        
        return Response({
            'agreements': agreement_serializer.data,
            'departments': department_serializer.data
        })

class AgreementDetailAPIView(APIView):
    """API view for agreement detail - matches path('<int:pk>/', views.agreement_detail)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        """Get detailed information about a specific agreement"""
        agreement = get_object_or_404(Agreement, pk=pk)
        user = request.user
        
        # Check if user is in an executive department
        is_executive = Department.objects.filter(
            executive=True,
            users=user
        ).exists()
        
        if not is_executive:
            # Check if user has access to this agreement
            if not (user.department == agreement.department or 
                    DepartmentPermission.objects.filter(
                        user=user,
                        department=agreement.department
                    ).exists()):
                return Response({
                    'error': 'You do not have permission to view this agreement.'
                }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AgreementSerializer(agreement)
        return Response(serializer.data)

class AgreementFormDataAPIView(APIView):
    """API view for form data - matches path('add/', views.add_agreement)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get form data for creating/editing agreements"""
        user = request.user
        
        # Check if user is in an executive department
        is_executive = Department.objects.filter(
            executive=True,
            users=user
        ).exists()
        
        if is_executive:
            return Response({
                'error': 'Executive users cannot create agreements.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get user's departments and permitted departments
        department_ids = set()
        if user.department:
            department_ids.add(user.department.id)
        
        permitted_dept_ids = DepartmentPermission.objects.filter(
            user=user,
            permission_type='edit'
        ).values_list('department_id', flat=True)
        department_ids.update(permitted_dept_ids)
        
        permitted_departments = Department.objects.filter(id__in=department_ids)
        department_serializer = DepartmentSerializer(permitted_departments, many=True)
        
        return Response({
            'departments': department_serializer.data,
            'user_info': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'department': {
                    'id': user.department.id,
                    'name': user.department.name
                } if user.department else None
            }
        })

class SubmitAgreementAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Debug logging
            logger.info("Starting agreement submission")
            logger.info(f"Request data: {request.data}")
            logger.info(f"Files: {request.FILES}")

            # Create form data
            form_data = request.data.dict()
            files = {'attachment': request.FILES.get('attachment')}

            # Create form instance
            form = AgreementForm(form_data, files, user=request.user)

            # For editing, make attachment not required if existing file exists
            if request.data.get('is_editing') == 'true':
                form.fields['attachment'].required = False
                logger.info("Set attachment as not required for editing")

            if form.is_valid():
                logger.info("Form is valid, saving agreement")
                agreement = form.save(commit=False)
                agreement.creator = request.user

                # Handle file upload
                if 'attachment' in request.FILES:
                    if agreement.pk and agreement.attachment:
                        agreement.attachment.delete(save=False)
                    file = request.FILES['attachment']
                    file_name = default_storage.save(f'agreements/{file.name}', ContentFile(file.read()))
                    agreement.attachment = file_name

                agreement.save()
                form.save_m2m()
                agreement.send_notification('created')

                logger.info(f"Agreement {agreement.id} saved successfully")
                return Response({
                    'success': True,
                    'message': 'Agreement created successfully',
                    'agreement_id': agreement.id
                })
            else:
                logger.error(f"Form validation failed: {form.errors}")
                return Response({
                    'success': False,
                    'message': 'Form validation failed',
                    'errors': form.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error creating agreement: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EditAgreementAPIView(APIView):
    """API view for editing agreements - matches path('edit/<int:agreement_id>/', views.edit_agreement)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, agreement_id):
        """Get agreement data for editing"""
        agreement = get_object_or_404(Agreement, id=agreement_id)
        user = request.user
        
        # Check if user is in an executive department
        is_executive = Department.objects.filter(
            executive=True,
            users=user
        ).exists()
        
        if is_executive:
            return Response({
                'error': 'Executive users cannot edit agreements.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user has permission to edit
        has_permission = (
            user in agreement.assigned_users.all() or
            (hasattr(user, 'department') and user.department == agreement.department) or
            DepartmentPermission.objects.filter(
                user=user,
                department=agreement.department,
                permission_type='edit'
            ).exists()
        )
        
        if not has_permission:
            return Response({
                'error': 'You do not have permission to edit this agreement.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AgreementSerializer(agreement)
        return Response(serializer.data)
    
    def put(self, request, agreement_id):
        """Update an existing agreement"""
        agreement = get_object_or_404(Agreement, id=agreement_id)
        user = request.user
        
        # Check if user is in an executive department
        is_executive = Department.objects.filter(
            executive=True,
            users=user
        ).exists()
        
        if is_executive:
            return Response({
                'error': 'Executive users cannot edit agreements.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user has permission to edit
        has_permission = (
            user in agreement.assigned_users.all() or
            (hasattr(user, 'department') and user.department == agreement.department) or
            DepartmentPermission.objects.filter(
                user=user,
                department=agreement.department,
                permission_type='edit'
            ).exists()
        )
        
        if not has_permission:
            return Response({
                'error': 'You do not have permission to edit this agreement.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AgreementSerializer(agreement, data=request.data, partial=True)
        if serializer.is_valid():
            updated_agreement = serializer.save()
            # Send notification to assigned users
            updated_agreement.send_notification('updated')
            return Response({
                'success': True,
                'message': 'Agreement updated successfully!',
                'agreement': serializer.data
            })
        else:
            return Response({
                'success': False,
                'message': 'Please correct the errors below.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

# SMTP User Access Management Endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_with_access(request, agreement_id):
    """Get all users with access to a specific agreement"""
    agreement = get_object_or_404(Agreement, pk=agreement_id)
    department = agreement.department

    # Combine department users and department permission users in a single query
    all_users = User.objects.filter(
        Q(department=department, is_active=True) |
        Q(department_permissions__department=department)
    ).distinct()

    users_data = all_users.values('id', 'email', 'full_name', 'department__name')
    return Response({
        'assigned_users': list(users_data),
        'agreement_id': agreement.id,
        'agreement_title': agreement.title
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manage_user_access(request, agreement_id):
    """Add or remove user access to an agreement"""
    agreement = get_object_or_404(Agreement, pk=agreement_id)
    user_id = request.data.get('user_id')
    should_have_access = request.data.get('should_have_access', False)
    
    # Check if request user has permission to modify this agreement's users
    if not (request.user.is_superuser or request.user == agreement.creator):
        raise PermissionDenied("You don't have permission to modify this agreement's users")
    
    user = get_object_or_404(User, pk=user_id)
    
    if should_have_access:
        agreement.assigned_users.add(user)
        action = 'added'
    else:
        agreement.assigned_users.remove(user)
        action = 'removed'
    
    logger.info(f"User {user.email} {action} from agreement {agreement.title}")
    return Response({
        'success': True,
        'message': f'User access {action} successfully',
        'user_id': user.id,
        'action': action
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_users(request):
    """Get list of users available to be assigned to agreements"""
    queryset = User.objects.filter(is_active=True)
    
    if not request.user.is_superuser:
        # For non-superusers, only show users from their department
        if request.user.department:
            queryset = queryset.filter(department=request.user.department)
        else:
            queryset = queryset.none()
    
    users = queryset.values('id', 'email', 'full_name', 'department__name')
    return Response({
        'available_users': list(users),
        'count': len(users)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_reminder(request, pk):
    agreement = get_object_or_404(Agreement, pk=pk)
    try:
        if agreement.send_reminder_email():
            return Response({'success': True, 'message': 'Test reminder sent'})
        return Response({'success': False, 'message': 'No recipients found'})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)

class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Agreement stats
        today = date.today()
        three_months = today + timedelta(days=90)
        # Only include agreements that exist (not deleted)
        agreements = Agreement.objects.all()
        # If you have a soft delete field like is_active or deleted, filter here, e.g.:
        # agreements = agreements.filter(is_active=True)
        active = agreements.filter(status='ongoing', expiry_date__gte=today).count()
        expiring_soon = agreements.filter(status='ongoing', expiry_date__lte=three_months, expiry_date__gte=today).count()
        expired = agreements.filter(status='expired').count()

        # Mock chart data (replace with real aggregation if needed)
        agreement_dept_data = [
            { 'name': dept.name, 'value': agreements.filter(department=dept).count() }
            for dept in Department.objects.filter(executive=False)
        ]
        one_month = today + timedelta(days=30)
        expiry_in_1_month = agreements.filter(expiry_date__gt=today, expiry_date__lte=one_month).count()
        agreement_status_data = [
            { 'name': 'Expiry in 6 months', 'value': agreements.filter(expiry_date__lte=today + timedelta(days=180), expiry_date__gt=three_months).count(), 'color': '#2980b9' },
            { 'name': 'Expiry in 3 months', 'value': expiring_soon, 'color': '#f39c12' },
            { 'name': 'Expiry within 1 month', 'value': expiry_in_1_month, 'color': '#e67e22' },
            { 'name': 'Expired', 'value': expired, 'color': '#e74c3c' },
        ]

        return Response({
            'active': active,
            'expiringSoon': expiring_soon,
            'expired': expired,
            'agreementDeptData': agreement_dept_data,
            'agreementStatusData': agreement_status_data,
        })

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if not user.check_password(old_password):
            return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        if not new_password or len(new_password) < 8:
            return Response({'error': 'New password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({'success': 'Password changed successfully.'})