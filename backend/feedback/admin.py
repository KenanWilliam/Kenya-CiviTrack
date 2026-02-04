from django.contrib import admin

from .models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("project", "user", "created_at")
    list_filter = ("created_at",)
    search_fields = ("body", "user__username", "project__title")
