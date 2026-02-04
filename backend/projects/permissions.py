from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOfficialOrAdminForWrite(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return user.is_authenticated and (
            getattr(user, "role", "") in {"ADMIN", "OFFICIAL"} or user.is_staff or user.is_superuser
        )
