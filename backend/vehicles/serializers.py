from rest_framework import serializers
from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    # Renamed to match what the frontend already expects (type, slot as
    # a plain code string) instead of the raw model field names — keeps
    # the React side simple.
    type = serializers.ChoiceField(source="vehicle_type", choices=Vehicle.VehicleType.choices)
    slot = serializers.CharField(source="slot.code", read_only=True, default=None)

    class Meta:
        model = Vehicle
        fields = ["id", "plate", "type", "status", "slot", "created_at"]
        read_only_fields = ["status", "slot", "created_at"]

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)