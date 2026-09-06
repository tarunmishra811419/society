from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import MaintenanceFee
from .serializers import MaintenanceFeeSerializer
from .permissions import IsOwnerOrAdmin
from .services import create_payment_order


class MaintenanceFeeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MaintenanceFeeSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return MaintenanceFee.objects.all()
        return MaintenanceFee.objects.filter(resident=user)

    @action(detail=True, methods=["post"], url_path="pay")
    def pay(self, request, pk=None):
        """POST /api/billing/fees/<id>/pay/ — starts a test-mode payment.
        This only creates the order; actual confirmation that money moved
        comes later via the webhook endpoint, not this response."""
        fee = self.get_object()
        try:
            order_id = create_payment_order(fee)
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        return Response({"order_id": order_id, "detail": "Payment order created (test mode)."}, status=200)