from django.contrib import admin
from .models import ParkingSlot


@admin.register(ParkingSlot)
class ParkingSlotAdmin(admin.ModelAdmin):
    list_display = ("code", "block", "status")
    list_filter = ("block", "status")

from .models import Amenity, AmenityBooking

@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ("name", "capacity", "slot_length")


@admin.register(AmenityBooking)
class AmenityBookingAdmin(admin.ModelAdmin):
    list_display = ("amenity", "resident", "date", "slot")
    list_filter = ("amenity",)