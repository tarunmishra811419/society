from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, ResidentProfile, SecurityProfile, MoveRequest, MoveRequestChecklistItem


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "first_name", "last_name", "role", "is_staff")
    list_filter = ("role", "is_staff", "is_active")
    fieldsets = UserAdmin.fieldsets + (
        ("Role", {"fields": ("role",)}),
    )


@admin.register(ResidentProfile)
class ResidentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "flat_number", "phone")
    search_fields = ("flat_number", "user__username")


@admin.register(SecurityProfile)
class SecurityProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "gate", "shift")


class MoveRequestChecklistItemInline(admin.TabularInline):
    model = MoveRequestChecklistItem
    extra = 1


@admin.register(MoveRequest)
class MoveRequestAdmin(admin.ModelAdmin):
    list_display = ("resident_name", "flat_number", "move_type", "requested_date")
    list_filter = ("move_type",)
    inlines = [MoveRequestChecklistItemInline]