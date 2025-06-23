from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from .forms import AgreementForm
from .models import Agreement
from accounts.models import DepartmentPermission, Department
from django.core.files.storage import default_storage
from django.core.files import File
import os
import json
from datetime import date

# Create your views here.

@login_required
def agreement_list(request):
    # Get agreements where user has access
    user_departments = [request.user.department] if request.user.department else []
    
    # Get departments where user has permissions through DepartmentPermission
    permitted_departments = Department.objects.filter(
        permitted_users__user=request.user
    ).distinct()
    user_departments.extend(permitted_departments)
    
    # Check if user is in an executive department
    is_executive = Department.objects.filter(
        executive=True,
        users=request.user
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
    return render(request, 'agreements/agreement_list.html', {
        'agreements': agreements,
        'departments': departments
    })

@login_required
def add_agreement(request):
    # Check if user is in an executive department
    is_executive = Department.objects.filter(
        executive=True,
        users=request.user
    ).exists()
    
    if is_executive:
        messages.error(request, 'Executive users cannot create agreements.')
        return redirect('agreements:agreement_list')
        
    if request.method == 'POST':
        # Check if we're coming from edit with an existing file
        existing_attachment = None
        if 'edit_from_preview' in request.GET and 'preview_form_data' in request.session:
            form_data = request.session.get('preview_form_data', {})
            if 'attachment' in form_data:
                existing_attachment = form_data['attachment']
        
        form = AgreementForm(request.POST, request.FILES, user=request.user)
        if form.is_valid():
            # Check if this is a preview request
            if 'preview' in request.POST:
                # Get the assigned users for preview
                department_id = form.cleaned_data.get('agreement_type')
                assigned_users = form.get_assigned_users(department_id)
                
                # Get the department name
                department_name = Department.objects.get(id=department_id).name
                
                # Save the file temporarily if it exists
                attachment = None
                if 'attachment' in request.FILES:
                    file = request.FILES['attachment']
                    # Save to a temporary location
                    temp_path = default_storage.save(f'temp/{file.name}', file)
                    attachment = {
                        'name': file.name,
                        'path': temp_path
                    }
                elif existing_attachment and default_storage.exists(existing_attachment['path']):
                    # Use the existing attachment if no new file was uploaded
                    attachment = existing_attachment
                
                # Store form data in session for edit
                form_data = {
                    'title': form.cleaned_data.get('title'),
                    'agreement_type': form.cleaned_data.get('agreement_type'),
                    'status': form.cleaned_data.get('status'),
                    'party_name': form.cleaned_data.get('party_name'),
                }
                
                # Handle date fields
                start_date = form.cleaned_data.get('start_date')
                if start_date:
                    form_data['start_date'] = start_date.isoformat()
                
                expiry_date = form.cleaned_data.get('expiry_date')
                if expiry_date:
                    form_data['expiry_date'] = expiry_date.isoformat()
                
                # Store attachment info in session if it exists
                if attachment:
                    form_data['attachment'] = attachment
                
                request.session['preview_form_data'] = form_data
                
                return render(request, 'agreements/agreement_preview.html', {
                    'form': form,
                    'assigned_users': assigned_users,
                    'attachment': attachment,
                    'department_name': department_name
                })
            # If not preview, redirect to submit
            return redirect('agreements:submit_agreement')
    else:
        # Check if we're coming from preview edit
        if 'edit_from_preview' in request.GET:
            # Get the form data from session
            form_data = request.session.get('preview_form_data', {})
            # Remove attachment from form_data as it will be handled separately
            attachment = form_data.pop('attachment', None)
            form = AgreementForm(initial=form_data, user=request.user)
            # If there was an attachment, add it to the form's files
            if attachment and default_storage.exists(attachment['path']):
                file = default_storage.open(attachment['path'])
                # Create a temporary URL for the file
                temp_url = default_storage.url(attachment['path'])
                # Create a custom file object with the URL
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
        # Create a mutable copy of POST data
        post_data = request.POST.copy()
        temp_file = None
        temp_path = None
        
        try:
            # If there's a temporary file path, get the file
            if 'attachment_path' in request.POST:
                temp_path = request.POST['attachment_path']
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
                
                # Clear the preview form data from session
                if 'preview_form_data' in request.session:
                    del request.session['preview_form_data']
                
                messages.success(request, 'Agreement created successfully!')
                return redirect('agreements:agreement_list')
            else:
                messages.error(request, 'Please correct the errors below.')
                return render(request, 'agreements/agreement_form.html', {'form': form})
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
    
    return redirect('agreements:add_agreement')

@login_required
def edit_agreement(request, agreement_id):
    agreement = get_object_or_404(Agreement, id=agreement_id)
    
    # Check if user is in an executive department
    is_executive = Department.objects.filter(
        executive=True,
        users=request.user
    ).exists()
    
    if is_executive:
        messages.error(request, 'Executive users cannot edit agreements.')
        return redirect('agreements:agreement_list')
    
    # Check if user has permission to edit
    has_permission = (
        request.user in agreement.assigned_users.all() or
        (hasattr(request.user, 'department') and request.user.department == agreement.department) or
        DepartmentPermission.objects.filter(
            user=request.user,
            department=agreement.department,
            permission_type='edit'
        ).exists()
    )
    
    if not has_permission:
        messages.error(request, 'You do not have permission to edit this agreement.')
        return redirect('agreements:agreement_list')

    if request.method == 'POST':
        form = AgreementForm(request.POST, request.FILES, instance=agreement, user=request.user)
        if form.is_valid():
            agreement = form.save(commit=False)
            agreement.creator = agreement.creator  # Keep original creator
            agreement.save()
            form.save_m2m()
            messages.success(request, 'Agreement updated successfully!')
            return redirect('agreements:agreement_list')
    else:
        form = AgreementForm(instance=agreement, user=request.user)
    
    return render(request, 'agreements/edit_agreement.html', {
        'form': form,
        'agreement': agreement
    })

@login_required
def agreement_detail(request, pk):
    agreement = get_object_or_404(Agreement, pk=pk)
    
    # Check if user is in an executive department
    is_executive = Department.objects.filter(
        executive=True,
        users=request.user
    ).exists()
    
    if is_executive:
        # Executive users can view any agreement
        return render(request, 'agreements/agreement_detail.html', {'agreement': agreement})
    
    # Check if user has access to this agreement
    if not (request.user.department == agreement.department or 
            DepartmentPermission.objects.filter(
                user=request.user,
                department=agreement.department
            ).exists()):
        messages.error(request, 'You do not have permission to view this agreement.')
        return redirect('agreements:agreement_list')
    return render(request, 'agreements/agreement_detail.html', {'agreement': agreement})
