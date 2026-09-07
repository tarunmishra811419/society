from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from vehicles.models import Vehicle
from .models import ParkingSlot, Amenity, AmenityBooking
from .serializers import ParkingSlotSerializer, AmenitySerializer, AmenityBookingSerializer
from .permissions import IsAdminOrReadOnly
from .services import allocate_slot_for_vehicle, NoAvailableSlotError, create_amenity_booking, SlotAlreadyBookedError


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


class AmenityViewSet(viewsets.ReadOnlyModelViewSet):
    """Just the list of available amenities — clubhouse, gym, pool, etc."""
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    permission_classes = [permissions.IsAuthenticated]


class AmenityBookingViewSet(viewsets.ModelViewSet):
    serializer_class = AmenityBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return AmenityBooking.objects.all()
        return AmenityBooking.objects.filter(resident=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            booking = create_amenity_booking(
                amenity_id=serializer.validated_data["amenity"].id,
                resident=request.user,
                date=serializer.validated_data["date"],
                slot=serializer.validated_data["slot"],
            )
        except SlotAlreadyBookedError as e:
            return Response({"detail": str(e)}, status=409)
        return Response(AmenityBookingSerializer(booking).data, status=201)