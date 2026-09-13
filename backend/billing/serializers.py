from rest_framework import serializers
from .models import MaintenanceFee, SocietyTransaction


class MaintenanceFeeSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source="resident.get_full_name", read_only=True)
    resident_username = serializers.CharField(source="resident.username", read_only=True)
    flat = serializers.CharField(
        source="resident.resident_profile.flat_number", read_only=True, default=None
    )
    phone = serializers.CharField(
        source="resident.resident_profile.phone", read_only=True, default=""
    )

    class Meta:
        model = MaintenanceFee
        fields = [
            "id",
            "resident",
            "resident_name",
            "resident_username",
            "flat",
            "phone",
            "period",
            "amount",
            "status",
            "due_date",
            "paid_on",
            "payment_reference",
            "payment_method",
            "receipt_number",
            "breakdown_json",
            "last_reminder_sent",
            "reminder_count",
        ]
        read_only_fields = [
            "status",
            "paid_on",
            "payment_reference",
            "receipt_number",
            "last_reminder_sent",
            "reminder_count",
        ]


class SocietyTransactionSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source="recorded_by.get_full_name", read_only=True)

    class Meta:
        model = SocietyTransaction
        fields = [
            "id",
            "entry_type",
            "category",
            "title",
            "amount",
            "date",
            "description",
            "reference_no",
            "recorded_by",
            "recorded_by_name",
            "created_at",
        ]
        read_only_fields = ["recorded_by", "created_at"]


class GenerateBillsSerializer(serializers.Serializer):
    period = serializers.CharField(max_length=50)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    due_date = serializers.DateField(required=False, allow_null=True)