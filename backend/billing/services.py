import secrets
from django.utils import timezone
from .models import MaintenanceFee


class PaymentFailedError(Exception):
    pass


def create_payment_order(fee: MaintenanceFee):
    """Stand-in for calling a real gateway (Razorpay/Stripe) in test mode.
    Returns a fake order reference the frontend would hand to a checkout
    widget in a real integration."""
    if fee.status == MaintenanceFee.Status.PAID:
        raise ValueError("This fee is already paid.")
    return f"order_test_{secrets.token_hex(6)}"


def confirm_payment(fee: MaintenanceFee, order_id: str, simulate_failure: bool = False):
    """Called once the (test-mode) gateway confirms payment. A real
    integration calls this from a webhook (see webhooks.py), not directly
    from the frontend — the frontend saying 'payment succeeded' isn't
    trustworthy on its own; the gateway's server-to-server confirmation is
    the actual source of truth for whether money moved."""
    if simulate_failure:
        raise PaymentFailedError("Payment failed — card declined (test mode).")

    fee.status = MaintenanceFee.Status.PAID
    fee.paid_on = timezone.now()
    fee.payment_reference = order_id
    fee.save()
    return fee