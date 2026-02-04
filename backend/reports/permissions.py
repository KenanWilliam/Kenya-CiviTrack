from rest_framework.permissions import BasePermission


class IsOfficialOrAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and (
            getattr(user, "role", "") in {"ADMIN", "OFFICIAL"} or user.is_staff or user.is_superuser
        )
