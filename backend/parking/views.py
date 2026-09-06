from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from vehicles.models import Vehicle
from .models import ParkingSlot
from .serializers import ParkingSlotSerializer
from .permissions import IsAdminOrReadOnly
from .services import allocate_slot_for_vehicle, NoAvailableSlotError


class ParkingSlotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ParkingSlot.objects.select_related("vehicle", "vehicle__owner").all()
    serializer_class = ParkingSlotSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    @action(detail=False, methods=["post"], url_path="allocate/(?P<vehicle_id>[^/.]+)")
    def allocate(self, request, vehicle_id=None):
        if request.user.role != "admin":
            return Response({"detail": "Only admins can allocate slots."}, status=403)
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id)
        except Vehicle.DoesNotExist:
            return Response({"detail": "Vehicle not found."}, status=404)
        try:
            slot = allocate_slot_for_vehicle(vehicle)
        except NoAvailableSlotError as e:
            return Response({"detail": str(e)}, status=409)
        return Response(ParkingSlotSerializer(slot).data, status=200)