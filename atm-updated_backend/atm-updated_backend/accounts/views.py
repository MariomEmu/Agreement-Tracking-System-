from rest_framework import viewsets, permissions
from .models import User, Department, Role
from .serializers import UserSerializer, DepartmentSerializer, RoleSerializer
from .permissions import IsSuperUser
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages

#Logic for User Login starts
def user_login(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, email=email, password=password)
        
        if user is not None:
            login(request, user)
            return redirect('accounts:dashboard')
        else:
            messages.error(request, 'Invalid email or password')
    
    return render(request, 'accounts/login.html')

@login_required
def dashboard(request):
    return render(request, 'accounts/dashboard.html')

def user_logout(request):
    logout(request)
    return redirect('accounts:user_login')

#Logic for User Login Ends

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsSuperUser]

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAdminUser]

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAdminUser]