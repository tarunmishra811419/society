from django.contrib import admin
from .models import Visitor, GuestApproval


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ("name", "host", "status", "qr_code", "checked_in_at")
    list_filter = ("status",)


@admin.register(GuestApproval)
class GuestApprovalAdmin(admin.ModelAdmin):
    list_display = ("visitor_name", "requested_by", "status", "created_at")
    list_filter = ("status",)

from .models import Package

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ("courier", "flat_number", "status", "logged_at")
    list_filter = ("status",)

from .models import StaffPass

@admin.register(StaffPass)
class StaffPassAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "owner", "valid_till", "qr_code")
    list_filter = ("role",)