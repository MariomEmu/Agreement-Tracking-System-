#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Agreement_tracking.settings')
django.setup()

from accounts.models import User, Department

def check_and_fix_user():
    test_email = 'demo.sonali@gmail.com'
    user = User.objects.get(email=test_email)
    
    print(f"User: {user.email}")
    print(f"Current department: {user.department.name if user.department else 'None'}")
    print(f"Department executive: {user.department.executive if user.department else 'None'}")
    
    if user.department and user.department.executive:
        print("PROBLEM: User is in executive department!")
        print("Moving user to IT department...")
        
        # Find IT department or create it
        it_dept = Department.objects.filter(name='IT').first()
        if not it_dept:
            it_dept = Department.objects.create(name='IT', description='Information Technology', executive=False)
        
        user.department = it_dept
        user.save()
        print(f"User moved to: {user.department.name}")
    else:
        print("User is in non-executive department - OK!")
    
    print("Login credentials:")
    print(f"Email: {test_email}")
    print("Password: password123")

if __name__ == '__main__':
    check_and_fix_user() 