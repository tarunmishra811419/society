from django.contrib import admin
from .models import MaintenanceFee


@admin.register(MaintenanceFee)
class MaintenanceFeeAdmin(admin.ModelAdmin):
    list_display = ("resident", "period", "amount", "status", "paid_on")
    list_filter = ("status",)
    search_fields = ("resident__username", "period")