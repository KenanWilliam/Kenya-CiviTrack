from django.shortcuts import render

from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from .models import SearchEvent, ProjectViewEvent
from projects.models import Project

class TrackSearchView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        q = (request.data.get("query") or "")[:200]
        SearchEvent.objects.create(query=q)
        return Response({"ok": True}, status=status.HTTP_201_CREATED)

class TrackProjectView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        pid = request.data.get("project_id")
        if not pid:
            return Response({"error": "project_id required"}, status=400)

        try:
            p = Project.objects.get(id=pid)
        except Project.DoesNotExist:
            return Response({"error": "project not found"}, status=404)

        ProjectViewEvent.objects.create(project=p)
        return Response({"ok": True}, status=status.HTTP_201_CREATED)

class PulseView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        total_projects = Project.objects.count()

        status_counts = (
            Project.objects.values("status")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        top_searches = (
            SearchEvent.objects.exclude(query="")
            .values("query")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )

        top_viewed = (
            ProjectViewEvent.objects.values("project_id", "project__title", "project__status", "project__county")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )

        recent_searches = list(
            SearchEvent.objects.order_by("-created_at")
            .values("query", "created_at")[:10]
        )
        recent_views = list(
            ProjectViewEvent.objects.order_by("-created_at")
            .values("project_id", "project__title", "created_at")[:10]
        )

        # budget totals (spent will be added in step 3; safe if missing)
        total_budget = 0.0
        total_spent = None

        if any(f.name == "budget" for f in Project._meta.fields):
            for p in Project.objects.all().only("budget"):
                if p.budget:
                    total_budget += float(p.budget)

        if any(f.name == "spent_amount" for f in Project._meta.fields):
            total_spent_val = 0.0
            for p in Project.objects.all().only("spent_amount"):
                if getattr(p, "spent_amount", None):
                    total_spent_val += float(p.spent_amount)
            total_spent = total_spent_val

        return Response({
            "total_projects": total_projects,
            "status_counts": list(status_counts),
            "top_searches": list(top_searches),
            "top_viewed": list(top_viewed),
            "recent_searches": recent_searches,
            "recent_views": recent_views,
            "total_budget": total_budget,
            "total_spent": total_spent,  # null until step 3
        })
