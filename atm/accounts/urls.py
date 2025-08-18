from django.urls import path, include
from .views import user_login, dashboard, user_logout
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, DepartmentViewSet, RoleViewSet
from .views import EmailAuthToken


app_name = 'accounts'

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'roles', RoleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('userLogin/', user_login, name='user_login'),
    path('dashboard/', dashboard, name='dashboard'),
   
    # Include API URLs
    path('api/', include('accounts.urls_api')),
    path('api-token-auth/', EmailAuthToken.as_view(), name='api_token_auth'),
]
