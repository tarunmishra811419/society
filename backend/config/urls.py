from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/', include('accounts.urls')),
    path('api/vehicles/', include('vehicles.urls')),
    path('api/parking/', include('parking.urls')),
    path('api/visitors/', include('visitors.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/complaints/', include('complaints.urls')),
    path('api/announcements/', include('announcements.urls')),
    path('api/audit/', include('audit.urls')),
]