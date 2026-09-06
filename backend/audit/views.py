from rest_framework import viewsets, permissions
from .models import AuditLog
from .serializers import AuditLogSerializer
from .permissions import IsAdminRole


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only — audit entries are created automatically by signals in
    signals.py, never directly through the API."""
    queryset = AuditLog.objects.select_related("actor").all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]