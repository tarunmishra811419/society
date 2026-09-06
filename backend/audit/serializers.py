from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.get_full_name", read_only=True, default="System")

    class Meta:
        model = AuditLog
        fields = ["id", "actor", "actor_name", "action", "target", "timestamp"]