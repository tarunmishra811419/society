from rest_framework import serializers
from .models import Visitor, GuestApproval, Package, StaffPass


class VisitorSerializer(serializers.ModelSerializer):
    host_flat = serializers.CharField(source="host.resident_profile.flat_number", read_only=True, default=None)

    class Meta:
        model = Visitor
        fields = ["id", "name", "purpose", "host_flat", "qr_code", "status", "checked_in_at", "created_at"]
        read_only_fields = ["qr_code", "status", "checked_in_at", "created_at"]


class GuestApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuestApproval
        fields = ["id", "visitor_name", "purpose", "status", "created_at"]
        read_only_fields = ["status", "created_at"]

    def create(self, validated_data):
        validated_data["requested_by"] = self.context["request"].user
        return super().create(validated_data)


class CheckInSerializer(serializers.Serializer):
    qr_code = serializers.CharField(max_length=50)

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ["id", "courier", "flat_number", "status", "has_photo", "logged_at"]
        read_only_fields = ["status", "has_photo", "logged_at"]

class StaffPassSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = StaffPass
        fields = ["id", "name", "role", "valid_till", "qr_code", "status", "created_at"]
        read_only_fields = ["qr_code", "created_at"]

    def get_status(self, obj):
        from django.utils import timezone
        days_left = (obj.valid_till - timezone.now().date()).days
        if days_left < 0:
            return "expired"
        if days_left <= 30:
            return "expiring"
        return "active"

    def create(self, validated_data):
        from .services import generate_staff_qr_code
        validated_data["owner"] = self.context["request"].user
        validated_data["qr_code"] = generate_staff_qr_code()
        return super().create(validated_data)