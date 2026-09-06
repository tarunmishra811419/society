from rest_framework import serializers
from .models import MaintenanceFee


class MaintenanceFeeSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source="resident.get_full_name", read_only=True)
    flat = serializers.CharField(source="resident.resident_profile.flat_number", read_only=True, default=None)

    class Meta:
        model = MaintenanceFee
        fields = ["id", "resident_name", "flat", "period", "amount", "status", "paid_on", "payment_reference"]
        read_only_fields = ["status", "paid_on", "payment_reference"]