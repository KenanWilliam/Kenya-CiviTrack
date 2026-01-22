from django.urls import path
from .views import TrackSearchView, TrackProjectView, PulseView

urlpatterns = [
    path("analytics/search/", TrackSearchView.as_view()),
    path("analytics/project-view/", TrackProjectView.as_view()),
    path("pulse/", PulseView.as_view()),
]
