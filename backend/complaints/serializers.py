from rest_framework import serializers
from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):
    flat = serializers.CharField(source="raised_by.resident_profile.flat_number", read_only=True, default=None)

    class Meta:
        model = Complaint
        fields = ["id", "title", "category", "flat", "status", "created_at"]
        read_only_fields = ["status", "created_at"]

    def create(self, validated_data):
        validated_data["raised_by"] = self.context["request"].user
        return super().create(validated_data)