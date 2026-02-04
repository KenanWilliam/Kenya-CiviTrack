from django.conf import settings
from django.db import models

from projects.models import Project


class Report(models.Model):
    class Category(models.TextChoices):
        CORRUPTION = "CORRUPTION", "Corruption"
        DELAY = "DELAY", "Delay"
        QUALITY = "QUALITY", "Quality issue"
        BUDGET = "BUDGET", "Budget concern"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        IN_REVIEW = "IN_REVIEW", "In review"
        RESOLVED = "RESOLVED", "Resolved"
        DISMISSED = "DISMISSED", "Dismissed"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="reports")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reports")
    category = models.CharField(max_length=30, choices=Category.choices, default=Category.OTHER)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Report({self.project_id}, {self.user_id}, {self.status})"
