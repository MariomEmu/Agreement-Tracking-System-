#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Agreement_tracking.settings')
django.setup()

from accounts.models import User, Department, Vendor
from django.contrib.auth.hashers import make_password

def create_test_data():
    print("Checking for existing data...")
    
    # Check if departments exist
    if not Department.objects.exists():
        print("Creating departments...")
        dept1 = Department.objects.create(name='IT Department', description='Information Technology', executive=False)
        dept2 = Department.objects.create(name='HR Department', description='Human Resources', executive=False)
        dept3 = Department.objects.create(name='Finance Department', description='Finance and Accounting', executive=False)
        print(f"Created departments: {list(Department.objects.values_list('name', flat=True))}")
    else:
        print(f"Departments exist: {list(Department.objects.values_list('name', flat=True))}")
    
    # Check if vendors exist
    if not Vendor.objects.exists():
        print("Creating vendors...")
        vendor1 = Vendor.objects.create(
            name='Tech Solutions Inc.',
            address='123 Tech Street, Silicon Valley, CA',
            email='contact@techsolutions.com',
            phone_number='+1234567890',
            contact_person_name='John Doe',
            contact_person_designation='Sales Manager'
        )
        vendor2 = Vendor.objects.create(
            name='Global Services Ltd.',
            address='456 Business Ave, New York, NY',
            email='info@globalservices.com',
            phone_number='+1987654321',
            contact_person_name='Jane Smith',
            contact_person_designation='Account Manager'
        )
        print(f"Created vendors: {list(Vendor.objects.values_list('name', flat=True))}")
    else:
        print(f"Vendors exist: {list(Vendor.objects.values_list('name', flat=True))}")
    
    # Check if test user exists
    test_email = 'demo.sonali@gmail.com'
    if not User.objects.filter(email=test_email).exists():
        print("Creating test user...")
        # Get the first non-executive department
        department = Department.objects.filter(executive=False).first()
        if not department:
            print("No non-executive departments found. Creating a default department...")
            department = Department.objects.create(name='Default Department', executive=False)
        
        user = User.objects.create(
            email=test_email,
            full_name='Demo User',
            department=department,
            password=make_password('password123'),
            is_active=True
        )
        print(f"Created test user: {user.email}")
        print("Login credentials:")
        print(f"Email: {test_email}")
        print("Password: password123")
    else:
        user = User.objects.get(email=test_email)
        print(f"Test user exists: {user.email}")
        
        # Check if user is in an executive department and fix if needed
        if user.department and user.department.executive:
            print("WARNING: User is in an executive department which cannot create agreements!")
            print("Moving user to a non-executive department...")
            
            # Find a non-executive department
            non_executive_dept = Department.objects.filter(executive=False).first()
            if not non_executive_dept:
                print("Creating a non-executive department...")
                non_executive_dept = Department.objects.create(name='IT Department', executive=False)
            
            user.department = non_executive_dept
            user.save()
            print(f"User moved to department: {non_executive_dept.name}")
        
        print("Login credentials:")
        print(f"Email: {test_email}")
        print("Password: password123")
    
    print("\nTest data setup complete!")
    print("You can now log in to the React app with the credentials above.")

if __name__ == '__main__':
    create_test_data() 