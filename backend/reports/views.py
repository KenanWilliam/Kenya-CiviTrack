from django.shortcuts import get_object_or_404
from rest_framework.generics import ListCreateAPIView, UpdateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from projects.models import Project
from .models import Report
from .serializers import ReportSerializer, ReportStatusSerializer
from .permissions import IsOfficialOrAdmin


class ProjectReportListCreateView(ListCreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        project_id = self.kwargs.get("project_id")
        return Report.objects.filter(project_id=project_id).select_related("user", "project")

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs.get("project_id"))
        serializer.save(project=project, user=self.request.user)


class ReportStatusUpdateView(UpdateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportStatusSerializer
    permission_classes = [IsOfficialOrAdmin]


class ReportAdminListView(ListAPIView):
    queryset = Report.objects.all().select_related("user", "project")
    serializer_class = ReportSerializer
    permission_classes = [IsOfficialOrAdmin]
