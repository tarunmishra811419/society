from django.contrib import admin
from .models import Visitor, GuestApproval, Package, StaffPass


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ("name", "host", "status", "qr_code", "checked_in_at", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("name", "qr_code", "host__username", "purpose")
    date_hierarchy = "created_at"


@admin.register(GuestApproval)
class GuestApprovalAdmin(admin.ModelAdmin):
    list_display = ("visitor_name", "requested_by", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("visitor_name", "requested_by__username", "purpose")


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ("courier", "flat_number", "status", "logged_at")
    list_filter = ("status", "logged_at")
    search_fields = ("courier", "flat_number")


@admin.register(StaffPass)
class StaffPassAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "owner", "valid_till", "qr_code")
    list_filter = ("role", "valid_till")
    search_fields = ("name", "qr_code", "owner__username")