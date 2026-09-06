from django.contrib import admin
from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("plate", "owner", "vehicle_type", "status", "slot")
    list_filter = ("vehicle_type", "status")
    search_fields = ("plate", "owner__username")