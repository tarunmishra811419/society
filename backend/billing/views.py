from decimal import Decimal
from django.db.models import Sum
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import MaintenanceFee, SocietyTransaction
from .serializers import (
    MaintenanceFeeSerializer,
    SocietyTransactionSerializer,
    GenerateBillsSerializer,
)
from .permissions import IsOwnerOrAdmin
from .services import (
    create_payment_order,
    confirm_payment,
    generate_monthly_bills,
    send_fee_reminder,
    PaymentFailedError,
)
from accounts.permissions import IsAdminRole


class MaintenanceFeeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MaintenanceFeeSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        queryset = MaintenanceFee.objects.select_related("resident", "resident__resident_profile")
        if user.role == "admin":
            return queryset.all()
        return queryset.filter(resident=user)

    @action(detail=True, methods=["post"], url_path="pay")
    def pay(self, request, pk=None):
        """Processes payment for a fee in test mode with specified payment method."""
        fee = self.get_object()
        if fee.status == MaintenanceFee.Status.PAID:
            return Response({"detail": "This fee has already been paid."}, status=status.HTTP_400_BAD_REQUEST)

        payment_method = request.data.get("payment_method", "card")
        order_id = create_payment_order(fee)

        try:
            confirmed_fee = confirm_payment(fee, order_id=order_id, payment_method=payment_method)
        except PaymentFailedError as e:
            return Response({"detail": str(e)}, status=status.HTTP_402_PAYMENT_REQUIRED)

        return Response(
            {
                "detail": f"Payment successfully processed via {payment_method.replace('_', ' ').upper()}.",
                "order_id": order_id,
                "fee": MaintenanceFeeSerializer(confirmed_fee).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["get"], url_path="receipt")
    def receipt(self, request, pk=None):
        """Returns official printable receipt data for a paid fee."""
        fee = self.get_object()
        if fee.status != MaintenanceFee.Status.PAID:
            return Response({"detail": "Receipt is only available for paid maintenance fees."}, status=status.HTTP_400_BAD_REQUEST)

        flat_num = getattr(getattr(fee.resident, "resident_profile", None), "flat_number", "N/A")
        phone = getattr(getattr(fee.resident, "resident_profile", None), "phone", "N/A")

        receipt_data = {
            "society": {
                "name": "Residentia Co-operative Housing Society",
                "registration_no": "CHS/REG/2021/4489",
                "address": "Plot 42, Sector 18, Phase 2, Residentia Hills - 560001",
                "email": "accounts@residentia.com",
            },
            "receipt_number": fee.receipt_number,
            "period": fee.period,
            "date": fee.paid_on.strftime("%d %b %Y, %I:%M %p") if fee.paid_on else None,
            "transaction_reference": fee.payment_reference,
            "payment_method": fee.get_payment_method_display(),
            "resident": {
                "name": fee.resident.get_full_name() or fee.resident.username,
                "flat": flat_num,
                "phone": phone,
            },
            "breakdown": fee.breakdown_json,
            "total_amount": float(fee.amount),
            "status": "PAID",
        }
        return Response(receipt_data)

    @action(detail=True, methods=["post"], url_path="remind", permission_classes=[permissions.IsAuthenticated, IsAdminRole])
    def remind(self, request, pk=None):
        """Sends payment reminder for an individual fee."""
        fee = self.get_object()
        if fee.status == MaintenanceFee.Status.PAID:
            return Response({"detail": "Fee is already paid. No reminder needed."}, status=status.HTTP_400_BAD_REQUEST)

        send_fee_reminder(fee, actor=request.user)
        return Response(
            {
                "detail": f"Reminder sent to {fee.resident.get_full_name() or fee.resident.username}.",
                "fee": MaintenanceFeeSerializer(fee).data,
            }
        )

    @action(detail=False, methods=["post"], url_path="remind-all", permission_classes=[permissions.IsAuthenticated, IsAdminRole])
    def remind_all(self, request):
        """Sends bulk reminders to all residents with overdue or unpaid fees."""
        unpaid_fees = MaintenanceFee.objects.filter(status__in=[MaintenanceFee.Status.DUE, MaintenanceFee.Status.OVERDUE])
        count = 0
        for fee in unpaid_fees:
            send_fee_reminder(fee, actor=request.user)
            count += 1

        return Response({"detail": f"Dispatched reminders to {count} outstanding flats.", "count": count})

    @action(detail=False, methods=["post"], url_path="generate-monthly", permission_classes=[permissions.IsAuthenticated, IsAdminRole])
    def generate_monthly(self, request):
        """Generates maintenance fee bills for all residents in batch."""
        serializer = GenerateBillsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = generate_monthly_bills(
            period=serializer.validated_data["period"],
            amount=serializer.validated_data["amount"],
            due_date=serializer.validated_data.get("due_date"),
        )
        return Response(result, status=status.HTTP_201_CREATED)


class SocietyTransactionViewSet(viewsets.ModelViewSet):
    """Society accounting ledger for tracking income and expenditures."""
    queryset = SocietyTransaction.objects.select_related("recorded_by").all()
    serializer_class = SocietyTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        """Aggregated summary of society income, expenses, and reserve balance."""
        income_total = SocietyTransaction.objects.filter(
            entry_type=SocietyTransaction.EntryType.INCOME
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

        expense_total = SocietyTransaction.objects.filter(
            entry_type=SocietyTransaction.EntryType.EXPENSE
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

        reserve_fund = income_total - expense_total

        # Category-wise breakdown
        categories = {}
        for row in SocietyTransaction.objects.values("entry_type", "category").annotate(total=Sum("amount")):
            cat = row["category"]
            categories[cat] = float(row["total"])

        return Response({
            "total_income": float(income_total),
            "total_expenses": float(expense_total),
            "reserve_fund": float(reserve_fund),
            "category_breakdown": categories,
        })