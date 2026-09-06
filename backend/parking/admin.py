from django.contrib import admin
from .models import ParkingSlot


@admin.register(ParkingSlot)
class ParkingSlotAdmin(admin.ModelAdmin):
    list_display = ("code", "block", "status")
    list_filter = ("block", "status")