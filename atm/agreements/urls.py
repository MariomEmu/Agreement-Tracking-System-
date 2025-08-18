from django.urls import path
from django.urls import path, include 
from . import views
from .views_api import users_with_access,test_reminder 

app_name = 'agreements'

urlpatterns = [
    path('', views.agreement_list, name='agreement_list'),
    path('add/', views.add_agreement, name='add_agreement'),
    #path('submit/', views.submit_agreement, name='submit_agreement'),
    path('api/agreements/submit/', views.submit_agreement, name='submit_agreement'),

    path('<int:pk>/', views.agreement_detail, name='agreement_detail'),
    path('edit/<int:agreement_id>/', views.edit_agreement, name='edit_agreement'),
     path('api/', include('agreements.urls_api')),
     path('api/agreements/<int:agreement_id>/users-with-access/', users_with_access, name='users_with_access'),


     # Change this line to use the API view directly
    path('api/agreements/<int:pk>/test-reminder/', test_reminder, name='test-reminder'),
]