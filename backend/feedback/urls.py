from django.urls import path
from .views import ProjectCommentListCreateView

urlpatterns = [
    path("projects/<int:project_id>/comments/", ProjectCommentListCreateView.as_view()),
]
