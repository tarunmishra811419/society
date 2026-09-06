from rest_framework import viewsets, permissions
from .models import Vehicle
from .serializers import VehicleSerializer
from .permissions import IsOwnerOrAdmin


class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin" or user.role == "security":
            return Vehicle.objects.all().order_by("-created_at")
        # Residents only ever see their own vehicles
        return Vehicle.objects.filter(owner=user).order_by("-created_at")