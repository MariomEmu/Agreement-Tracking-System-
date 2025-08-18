from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.core.files.storage import default_storage
from django.core.files import File
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils.dateparse import parse_date


from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .utils.email_utils import send_agreement_reminder

from .forms import AgreementForm
from .models import Agreement
from accounts.models import DepartmentPermission, Department, Vendor
from django.contrib.auth import get_user_model



import os
from datetime import date

User = get_user_model()





# Existing HTML Views

@login_required
def agreement_list(request):
    user_departments = [request.user.department] if request.user.department else []
    permitted_departments = Department.objects.filter(permitted_users__user=request.user).distinct()
    user_departments.extend(permitted_departments)
    is_executive = Department.objects.filter(executive=True, users=request.user).exists()

    if is_executive:
        agreements = Agreement.objects.all()
    else:
        agreements = Agreement.objects.filter(department__in=user_departments)

    agreements = agreements.order_by('-created_at')
    departments = Department.objects.all()
    return render(request, 'agreements/agreement_list.html', {
        'agreements': agreements,
        'departments': departments
    })


@login_required
def add_agreement(request):
    is_executive = Department.objects.filter(executive=True, users=request.user).exists()
    if is_executive:
        messages.error(request, 'Executive users cannot create agreements.')
        return redirect('agreements:agreement_list')

    if request.method == 'POST':
        existing_attachment = None
        if 'edit_from_preview' in request.GET and 'preview_form_data' in request.session:
            form_data = request.session.get('preview_form_data', {})
            if 'attachment' in form_data:
                existing_attachment = form_data['attachment']

        form = AgreementForm(request.POST, request.FILES, user=request.user)
        if form.is_valid():
            if 'preview' in request.POST:
                department_id = form.cleaned_data.get('agreement_type')
                assigned_users = form.get_assigned_users(department_id)
                department_name = Department.objects.get(id=department_id).name

                attachment = None
                if 'attachment' in request.FILES:
                    file = request.FILES['attachment']
                    temp_path = default_storage.save(f'temp/{file.name}', file)
                    attachment = {'name': file.name, 'path': temp_path}
                elif existing_attachment and default_storage.exists(existing_attachment['path']):
                    attachment = existing_attachment

                form_data = {
                    'title': form.cleaned_data.get('title'),
                    'agreement_reference': form.cleaned_data.get('agreement_reference'),
                    'agreement_type': form.cleaned_data.get('agreement_type'),
                    'status': form.cleaned_data.get('status'),
                    'party_name': form.cleaned_data.get('party_name').pk if form.cleaned_data.get('party_name') else None,
                    'reminder_time': form.cleaned_data.get('reminder_time').isoformat() if form.cleaned_data.get('reminder_time') else None,
                    'start_date': form.cleaned_data.get('start_date').isoformat() if form.cleaned_data.get('start_date') else None,
                    'expiry_date': form.cleaned_data.get('expiry_date').isoformat() if form.cleaned_data.get('expiry_date') else None,
                }

                if attachment:
                    form_data['attachment'] = attachment

                request.session['preview_form_data'] = form_data

                return render(request, 'agreements/agreement_preview.html', {
                    'form': form,
                    'assigned_users': assigned_users,
                    'attachment': attachment,
                    'department_name': department_name
                })

            return redirect('agreements:submit_agreement')

    else:
        if 'edit_from_preview' in request.GET:
            form_data = request.session.get('preview_form_data', {})
            attachment = form_data.pop('attachment', None)
            form = AgreementForm(initial=form_data, user=request.user)
            if attachment and default_storage.exists(attachment['path']):
                file = default_storage.open(attachment['path'])
                temp_url = default_storage.url(attachment['path'])

                class FileWithURL(File):
                    def __init__(self, file, name, url):
                        super().__init__(file, name)
                        self.url = url

                file_obj = FileWithURL(file, name=attachment['name'], url=temp_url)
                form.files = {'attachment': file_obj}
        else:
            form = AgreementForm(user=request.user)

    return render(request, 'agreements/agreement_form.html', {'form': form})


@login_required
def submit_agreement(request):
    if request.method == 'POST':
        post_data = request.POST.copy()
        temp_file = None
        temp_path = None

        try:
            if 'attachment_path' in request.POST:
                temp_path = request.POST['attachment_path']
                if default_storage.exists(temp_path):
                    temp_file = default_storage.open(temp_path)
                    file_obj = File(temp_file, name=os.path.basename(temp_path))
                    request.FILES['attachment'] = file_obj

            form = AgreementForm(post_data, request.FILES, user=request.user)
            if form.is_valid():
                agreement = form.save(commit=False)
                agreement.creator = request.user
                agreement.save()
                form.save_m2m()

                if 'preview_form_data' in request.session:
                    del request.session['preview_form_data']

                messages.success(request, 'Agreement created successfully!')
                return redirect('agreements:agreement_list')
            else:
                messages.error(request, 'Please correct the errors below.')
                return render(request, 'agreements/agreement_form.html', {'form': form})
        finally:
            if temp_file:
                temp_file.close()
            if temp_path and default_storage.exists(temp_path):
                try:
                    default_storage.delete(temp_path)
                except PermissionError:
                    pass

    return redirect('agreements:add_agreement')


@login_required
def edit_agreement(request, agreement_id):
    agreement = get_object_or_404(Agreement, id=agreement_id)
    is_executive = Department.objects.filter(executive=True, users=request.user).exists()
    if is_executive:
        messages.error(request, 'Executive users cannot edit agreements.')
        return redirect('agreements:agreement_list')

    has_permission = (
        request.user in agreement.assigned_users.all() or
        (hasattr(request.user, 'department') and request.user.department == agreement.department) or
        DepartmentPermission.objects.filter(user=request.user, department=agreement.department, permission_type='edit').exists()
    )
    if not has_permission:
        messages.error(request, 'You do not have permission to edit this agreement.')
        return redirect('agreements:agreement_list')

    if request.method == 'POST':
        form = AgreementForm(request.POST, request.FILES, instance=agreement, user=request.user)
        if form.is_valid():
            agreement = form.save(commit=False)
            agreement.creator = agreement.creator
            agreement.save()
            form.save_m2m()
            messages.success(request, 'Agreement updated successfully!')
            return redirect('agreements:agreement_list')
    else:
        form = AgreementForm(instance=agreement, user=request.user)

    return render(request, 'agreements/edit_agreement.html', {'form': form, 'agreement': agreement})


@login_required
def agreement_detail(request, pk):
    agreement = get_object_or_404(Agreement, pk=pk)
    is_executive = Department.objects.filter(executive=True, users=request.user).exists()
    if is_executive:
        return render(request, 'agreements/agreement_detail.html', {'agreement': agreement})

    if not (request.user.department == agreement.department or
            DepartmentPermission.objects.filter(user=request.user, department=agreement.department).exists()):
        messages.error(request, 'You do not have permission to view this agreement.')
        return redirect('agreements:agreement_list')

    return render(request, 'agreements/agreement_detail.html', {'agreement': agreement})


# ✅ New: API endpoint for React frontend

@csrf_exempt
def api_submit_agreement(request):
    if request.method == 'POST':
        try:
            data = request.POST
            files = request.FILES

            # Get related objects
            agreement_type = Department.objects.get(id=data.get('agreement_type'))
            party_name = Vendor.objects.get(id=data.get('party_name'))

            # Create agreement
            agreement = Agreement(
                title=data.get('title'),
                agreement_reference=data.get('agreement_reference'),
                agreement_type=agreement_type,
                party_name=party_name,
                start_date=parse_date(data.get('start_date')),
                expiry_date=parse_date(data.get('expiry_date')),
                reminder_time=parse_date(data.get('reminder_time')),
                status=data.get('status'),
            )

            # Set creator as current user (Important for emails later)
            agreement.creator = request.user

            if files.get('attachment'):
                agreement.attachment = files.get('attachment')

            agreement.save()

            return JsonResponse({'success': True, 'id': agreement.id})

        except Exception as e:
            import traceback
            print(traceback.format_exc())
        return JsonResponse({'success': False, 'error': f"Error creating agreement: {str(e)}"}, status=500)

    return JsonResponse({'error': 'Invalid request method.'}, status=405)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_reminder(request, pk):
    agreement = get_object_or_404(Agreement, pk=pk)
    try:
        agreement.send_reminder(request.user)
        return Response({
            'status': 'Reminder sent successfully',
            'to': request.user.email
        }, status=200)
    except Exception as e:
        return Response({
            'error': str(e),
            'message': 'Failed to send reminder'
        }, status=500)