from django.shortcuts import get_object_or_404
from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from projects.models import Project
from .models import Comment
from .serializers import CommentSerializer


class ProjectCommentListCreateView(ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        project_id = self.kwargs.get("project_id")
        return Comment.objects.filter(project_id=project_id).select_related("user", "project")

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs.get("project_id"))
        serializer.save(project=project, user=self.request.user)
