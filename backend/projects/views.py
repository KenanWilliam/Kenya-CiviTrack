from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Project
from .serializers import ProjectSerializer
from .permissions import IsOfficialOrAdminForWrite

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by("-created_at")
    serializer_class = ProjectSerializer
    permission_classes = [IsOfficialOrAdminForWrite]

    @action(detail=False, methods=["get"])
    def map(self, request):
        # lightweight payload for markers
        qs = self.get_queryset().exclude(latitude__isnull=True).exclude(longitude__isnull=True)
        data = qs.values("id", "title", "status", "latitude", "longitude")
        return Response(list(data))
