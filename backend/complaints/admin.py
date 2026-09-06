from django.contrib import admin
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ("title", "raised_by", "category", "status", "created_at")
    list_filter = ("category", "status")
    search_fields = ("title", "raised_by__username")