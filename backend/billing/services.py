import secrets
from decimal import Decimal
from django.utils import timezone
from .models import MaintenanceFee, SocietyTransaction
from accounts.models import User
from audit.models import AuditLog


class PaymentFailedError(Exception):
    pass


def generate_receipt_number():
    year = timezone.now().year
    token = secrets.token_hex(3).upper()
    return f"REC-{year}-{token}"


def calculate_default_breakdown(amount: Decimal):
    base = round(amount * Decimal("0.75"), 2)
    water = round(amount * Decimal("0.10"), 2)
    sinking = round(amount * Decimal("0.08"), 2)
    common = amount - base - water - sinking
    return {
        "Base Maintenance": float(base),
        "Water & Sanitation": float(water),
        "Sinking Fund": float(sinking),
        "Common Area Electricity": float(common),
    }


def create_payment_order(fee: MaintenanceFee):
    if fee.status == MaintenanceFee.Status.PAID:
        raise ValueError("This fee is already paid.")
    return f"order_test_{secrets.token_hex(6)}"


def confirm_payment(
    fee: MaintenanceFee,
    order_id: str,
    payment_method: str = "card",
    simulate_failure: bool = False,
):
    if simulate_failure:
        raise PaymentFailedError("Payment failed — transaction declined in test mode.")

    fee.status = MaintenanceFee.Status.PAID
    fee.paid_on = timezone.now()
    fee.payment_reference = order_id
    fee.payment_method = payment_method
    if not fee.receipt_number:
        fee.receipt_number = generate_receipt_number()

    if not fee.breakdown_json:
        fee.breakdown_json = calculate_default_breakdown(fee.amount)

    fee.save()

    # Automatically record entry into Society Accounting Ledger
    flat_num = getattr(getattr(fee.resident, "resident_profile", None), "flat_number", "N/A")
    resident_name = fee.resident.get_full_name() or fee.resident.username

    SocietyTransaction.objects.get_or_create(
        reference_no=order_id,
        defaults={
            "entry_type": SocietyTransaction.EntryType.INCOME,
            "category": SocietyTransaction.Category.MAINTENANCE,
            "title": f"Maintenance Collection - Flat {flat_num} ({resident_name})",
            "amount": fee.amount,
            "date": timezone.now().date(),
            "description": f"Paid for {fee.period} via {payment_method.replace('_', ' ').upper()}",
            "recorded_by": fee.resident,
        },
    )

    return fee


def generate_monthly_bills(period: str, amount: Decimal, due_date=None):
    """Generates monthly maintenance bills for all registered residents."""
    residents = User.objects.filter(role=User.Role.RESIDENT)
    created_count = 0
    existing_count = 0

    for resident in residents:
        _, created = MaintenanceFee.objects.get_or_create(
            resident=resident,
            period=period,
            defaults={
                "amount": amount,
                "status": MaintenanceFee.Status.DUE,
                "due_date": due_date,
                "breakdown_json": calculate_default_breakdown(amount),
            },
        )
        if created:
            created_count += 1
        else:
            existing_count += 1

    return {
        "period": period,
        "amount": float(amount),
        "created_count": created_count,
        "existing_count": existing_count,
        "total_residents": residents.count(),
    }


def send_fee_reminder(fee: MaintenanceFee, actor=None):
    """Triggers an in-app and simulated SMS/Email reminder to the resident."""
    fee.last_reminder_sent = timezone.now()
    fee.reminder_count += 1
    fee.save()

    flat_num = getattr(getattr(fee.resident, "resident_profile", None), "flat_number", "N/A")
    AuditLog.objects.create(
        actor=actor,
        action="Sent payment reminder",
        target=f"Flat {flat_num} ({fee.resident.get_full_name() or fee.resident.username}) - {fee.period}",
    )
    return fee