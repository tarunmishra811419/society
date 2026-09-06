from django.db.models.signals import post_save
from django.dispatch import receiver

from vehicles.models import Vehicle
from visitors.models import GuestApproval, Visitor
from billing.models import MaintenanceFee
from .models import AuditLog
from .middleware import get_current_user


def _actor():
    """Whoever is logged in and making the current request — read from
    the thread-local the middleware set. Falls back to None (shown as
    'System') for background jobs with no request in flight."""
    user = get_current_user()
    return user if (user and user.is_authenticated) else None


@receiver(post_save, sender=Vehicle)
def log_vehicle_save(sender, instance, created, **kwargs):
    if created:
        AuditLog.objects.create(
            actor=_actor(),
            action="Registered vehicle",
            target=f"{instance.plate} ({instance.owner})",
        )
    elif instance.status == Vehicle.Status.ACTIVE and instance.slot_id:
        AuditLog.objects.create(
            actor=_actor(),
            action="Vehicle assigned parking slot",
            target=f"{instance.plate} -> {instance.slot.code}",
        )


@receiver(post_save, sender=GuestApproval)
def log_guest_approval(sender, instance, created, **kwargs):
    if not created and instance.status == GuestApproval.Status.APPROVED:
        AuditLog.objects.create(
            actor=_actor(),
            action="Approved guest entry",
            target=f"{instance.visitor_name} -> {instance.requested_by}",
        )


@receiver(post_save, sender=Visitor)
def log_visitor_checkin(sender, instance, created, **kwargs):
    if not created and instance.status == Visitor.Status.CHECKED_IN:
        AuditLog.objects.create(
            actor=_actor(),
            action="Checked in visitor",
            target=f"{instance.name} ({instance.qr_code})",
        )


@receiver(post_save, sender=MaintenanceFee)
def log_fee_paid(sender, instance, created, **kwargs):
    if not created and instance.status == MaintenanceFee.Status.PAID:
        AuditLog.objects.create(
            actor=_actor(),
            action="Maintenance fee paid",
            target=f"{instance.resident} - {instance.period} - ₹{instance.amount}",
        )