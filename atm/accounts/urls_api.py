from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, DepartmentViewSet, RoleViewSet
from .views import DepartmentPermissionViewSet
from .views_api import LoginView, LogoutView, DashboardView, DepartmentListAPIView, VendorListAPIView, MyDepartmentsAPIView


router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'permissions', DepartmentPermissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='api-login'),
    path('logout/', LogoutView.as_view(), name='api-logout'),
    path('dashboard/', DashboardView.as_view(), name='api-dashboard'),
    path('departments/', DepartmentListAPIView.as_view(), name='department-list-api'),
    path('vendors/', VendorListAPIView.as_view(), name='vendor-list-api'),
    path('my_departments/', MyDepartmentsAPIView.as_view(), name='my-departments-api'),
    
]
