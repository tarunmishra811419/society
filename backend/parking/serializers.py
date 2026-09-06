from rest_framework import serializers
from .models import ParkingSlot


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