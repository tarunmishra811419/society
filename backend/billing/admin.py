from django.contrib import admin
from .models import MaintenanceFee, SocietyTransaction


@admin.register(MaintenanceFee)
class MaintenanceFeeAdmin(admin.ModelAdmin):
    list_display = ("resident", "period", "amount", "status", "payment_method", "paid_on", "receipt_number")
    list_filter = ("status", "payment_method")
    search_fields = ("resident__username", "period", "receipt_number", "payment_reference")


@admin.register(SocietyTransaction)
class SocietyTransactionAdmin(admin.ModelAdmin):
    list_display = ("title", "entry_type", "category", "amount", "date", "recorded_by")
    list_filter = ("entry_type", "category", "date")
    search_fields = ("title", "reference_no", "description")