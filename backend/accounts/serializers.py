from rest_framework import serializers
from .models import User, ResidentProfile, MoveRequest, MoveRequestChecklistItem


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="get_full_name", read_only=True)
    flat = serializers.CharField(source="resident_profile.flat_number", read_only=True, default=None)
    gate = serializers.CharField(source="security_profile.gate", read_only=True, default=None)

    class Meta:
        model = User
        fields = ["id", "username", "name", "role", "flat", "gate"]


class RegisterResidentSerializer(serializers.ModelSerializer):
    flat_number = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "password", "first_name", "last_name", "flat_number"]

    def create(self, validated_data):
        flat_number = validated_data.pop("flat_number")
        password = validated_data.pop("password")
        user = User(role=User.Role.RESIDENT, **validated_data)
        user.set_password(password)
        user.save()
        ResidentProfile.objects.create(user=user, flat_number=flat_number)
        return user

class MoveRequestChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoveRequestChecklistItem
        fields = ["id", "label", "done"]


class MoveRequestSerializer(serializers.ModelSerializer):
    checklist = MoveRequestChecklistItemSerializer(many=True, read_only=True)

    class Meta:
        model = MoveRequest
        fields = ["id", "flat_number", "resident_name", "move_type", "requested_date", "checklist", "created_at"]