from django.db import models
from projects.models import Project

class SearchEvent(models.Model):
    query = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class ProjectViewEvent(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="view_events")
    created_at = models.DateTimeField(auto_now_add=True)
