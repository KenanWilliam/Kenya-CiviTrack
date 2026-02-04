from django.contrib import admin

from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("project", "user", "category", "status", "created_at")
    list_filter = ("status", "category", "created_at")
    search_fields = ("description", "user__username", "project__title")
