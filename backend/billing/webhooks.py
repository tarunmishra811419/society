from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import MaintenanceFee
from .services import confirm_payment, PaymentFailedError


class PaymentWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        fee_id = request.data.get("fee_id")
        order_id = request.data.get("order_id")
        status = request.data.get("status", "success")

        try:
            fee = MaintenanceFee.objects.get(id=fee_id)
        except MaintenanceFee.DoesNotExist:
            return Response({"detail": "Unknown fee_id."}, status=404)

        try:
            confirm_payment(fee, order_id, simulate_failure=(status != "success"))
        except PaymentFailedError as e:
            return Response({"detail": str(e)}, status=402)

        return Response({"detail": "Payment confirmed.", "status": fee.status}, status=200)