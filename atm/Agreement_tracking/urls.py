from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from accounts.views_api import get_csrf_token



urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include(('accounts.urls', 'accounts'), namespace='accounts')),
    path('agreements/', include('agreements.urls')),

    # ✅ API routes
    path('api/', include('agreements.urls_api')),
    path('api/accounts/', include('accounts.urls_api')),
   
     # ✅ CSRF token endpoint for frontend React app
    path('api/get-csrf/', get_csrf_token),
]

# ✅ Media file serving in development only
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
