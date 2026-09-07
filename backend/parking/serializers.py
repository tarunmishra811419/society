from rest_framework import serializers
from .models import ParkingSlot, Amenity, AmenityBooking


class ParkingSlotSerializer(serializers.ModelSerializer):
    assigned_to = serializers.SerializerMethodField()

    class Meta:
        model = ParkingSlot
        fields = ["id", "code", "block", "status", "assigned_to"]

    def get_assigned_to(self, obj):
        vehicle = getattr(obj, "vehicle", None)
        if vehicle is None:
            return None
        return f"{vehicle.owner.get_full_name()} · {vehicle.plate}"

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ["id", "name", "capacity", "slot_length"]


class AmenityBookingSerializer(serializers.ModelSerializer):
    amenity_name = serializers.CharField(source="amenity.name", read_only=True)

    class Meta:
        model = AmenityBooking
        fields = ["id", "amenity", "amenity_name", "date", "slot", "created_at"]
        read_only_fields = ["created_at"]
        # Conflict detection happens in services.create_amenity_booking
        # (with a real row lock), not here — without this, DRF's automatic
        # unique-together check would race ahead of that locked check and
        # return a generic validation error instead of our clear message.
        validators = []