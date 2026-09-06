from rest_framework.permissions import BasePermission


class IsOwnerOrStaff(BasePermission):
    """Residents see/manage their own complaints. Admin can see and update
    status on all of them (to mark in-progress/resolved)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        return obj.raised_by_id == request.user.id