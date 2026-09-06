from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "actor", "action", "target")
    list_filter = ("action",)
    search_fields = ("actor__username", "action", "target")
    readonly_fields = ("actor", "action", "target", "timestamp")