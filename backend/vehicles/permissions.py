from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrAdmin(BasePermission):
    """Residents can only see/edit their own vehicles. Admins can see/edit
    all of them. Security guards get read-only access."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == "admin":
            return True
        if user.role == "security":
            return request.method in SAFE_METHODS
        return obj.owner_id == user.id