from django.utils import timezone
from rest_framework import serializers
from .models import Visitor, GuestApproval, Package, StaffPass


class VisitorSerializer(serializers.ModelSerializer):
    host_name = serializers.CharField(source="host.get_full_name", read_only=True)
    host_flat = serializers.CharField(source="host.resident_profile.flat_number", read_only=True, default=None)
    host_phone = serializers.CharField(source="host.resident_profile.phone", read_only=True, default="")
    qr_image = serializers.SerializerMethodField()
    stay_duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Visitor
        fields = [
            "id",
            "name",
            "phone",
            "purpose",
            "vehicle_number",
            "expected_date",
            "host",
            "host_name",
            "host_flat",
            "host_phone",
            "qr_code",
            "qr_image",
            "otp",
            "status",
            "entry_gate",
            "checked_in_at",
            "checked_out_at",
            "stay_duration_minutes",
            "created_at",
        ]
        read_only_fields = ["qr_code", "otp", "status", "checked_in_at", "checked_out_at", "created_at"]

    def get_qr_image(self, obj):
        from .services import generate_qr_image_data_url
        return generate_qr_image_data_url(obj.qr_code)

    def get_stay_duration_minutes(self, obj):
        if not obj.checked_in_at:
            return None
        end_time = obj.checked_out_at or timezone.now()
        duration = end_time - obj.checked_in_at
        return max(0, int(duration.total_seconds() // 60))


class GuestApprovalSerializer(serializers.ModelSerializer):
    host_name = serializers.CharField(source="requested_by.get_full_name", read_only=True)
    host_flat = serializers.CharField(source="requested_by.resident_profile.flat_number", read_only=True, default=None)
    visitor_pass = VisitorSerializer(source="visitor", read_only=True)

    class Meta:
        model = GuestApproval
        fields = [
            "id",
            "visitor_name",
            "phone",
            "purpose",
            "vehicle_number",
            "expected_date",
            "status",
            "host_name",
            "host_flat",
            "visitor",
            "visitor_pass",
            "created_at",
        ]
        read_only_fields = ["status", "visitor", "created_at"]

    def create(self, validated_data):
        from .services import approve_guest
        validated_data["requested_by"] = self.context["request"].user
        approval = super().create(validated_data)
        # When a resident pre-approves, immediately generate the Visitor pass and OTP
        approve_guest(approval)
        approval.refresh_from_db()
        return approval


class CheckInSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50, required=False)
    qr_code = serializers.CharField(max_length=50, required=False)
    gate = serializers.CharField(max_length=50, required=False, default="Main Gate")

    def validate(self, attrs):
        code = attrs.get("code") or attrs.get("qr_code")
        if not code:
            raise serializers.ValidationError("Please provide either an OTP code or QR code.")
        attrs["resolved_code"] = code.strip()
        return attrs


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = [
            "id",
            "company",
            "courier",
            "flat_number",
            "delivery_person_name",
            "delivery_person_phone",
            "tracking_pin",
            "status",
            "has_photo",
            "logged_at",
            "collected_at",
        ]
        read_only_fields = ["status", "has_photo", "logged_at", "collected_at"]


class StaffPassSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    qr_image = serializers.SerializerMethodField()

    class Meta:
        model = StaffPass
        fields = ["id", "name", "phone", "role", "valid_till", "qr_code", "qr_image", "status", "created_at"]
        read_only_fields = ["qr_code", "created_at"]

    def get_qr_image(self, obj):
        from .services import generate_qr_image_data_url
        return generate_qr_image_data_url(obj.qr_code)

    def get_status(self, obj):
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