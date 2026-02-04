from django.urls import path
from .views import ProjectReportListCreateView, ReportStatusUpdateView, ReportAdminListView

urlpatterns = [
    path("projects/<int:project_id>/reports/", ProjectReportListCreateView.as_view()),
    path("reports/", ReportAdminListView.as_view()),
    path("reports/<int:pk>/", ReportStatusUpdateView.as_view()),
]
