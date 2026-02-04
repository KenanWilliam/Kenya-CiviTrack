from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "county", "status", "progress", "updated_at")
    list_filter = ("county", "status")
    search_fields = ("title", "county")
