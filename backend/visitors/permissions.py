from rest_framework.permissions import BasePermission


class IsHostOrStaff(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in ("admin", "security"):
            return True
        return obj.host_id == user.id


class IsSecurityOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in ("security", "admin")
        )