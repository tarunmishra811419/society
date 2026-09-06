from rest_framework.permissions import BasePermission


class IsOwnerOrAdmin(BasePermission):
    """Residents only see their own fees. Admins see everyone's."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        return obj.resident_id == request.user.id