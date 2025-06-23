from django.urls import path
from . import views

app_name = 'agreements'

urlpatterns = [
    path('', views.agreement_list, name='agreement_list'),
    path('add/', views.add_agreement, name='add_agreement'),
    path('submit/', views.submit_agreement, name='submit_agreement'),
    path('<int:pk>/', views.agreement_detail, name='agreement_detail'),
    path('edit/<int:agreement_id>/', views.edit_agreement, name='edit_agreement'),
]