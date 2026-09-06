from django.conf import settings
from django.db import models


class Visitor(models.Model):
    class Status(models.TextChoices):
        AWAITING_APPROVAL = "awaiting_approval", "Awaiting approval"
        APPROVED = "approved", "Approved"
        CHECKED_IN = "checked_in", "Checked in"
        CHECKED_OUT = "checked_out", "Checked out"

    name = models.CharField(max_length=100)
    purpose = models.CharField(max_length=200, blank=True)
    host = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="visitors"
    )
    qr_code = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AWAITING_APPROVAL)
    checked_in_at = models.DateTimeField(null=True, blank=True)
    checked_out_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} -> {self.host} ({self.status})"


class GuestApproval(models.Model):
    """A resident's request to pre-approve a guest, before the guest
    arrives at the gate. Approving this creates/activates a Visitor pass."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        DENIED = "denied", "Denied"

    visitor_name = models.CharField(max_length=100)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="guest_requests"
    )
    purpose = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    visitor = models.OneToOneField(
        Visitor, on_delete=models.SET_NULL, null=True, blank=True, related_name="guest_approval"
    )

    def __str__(self):
        return f"{self.visitor_name} requested by {self.requested_by} ({self.status})"

class Package(models.Model):
    class Status(models.TextChoices):
        WAITING = "waiting", "Waiting"
        COLLECTED = "collected", "Collected"

    courier = models.CharField(max_length=100)
    flat_number = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.WAITING)
    has_photo = models.BooleanField(default=False)
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-logged_at"]

    def __str__(self):
        return f"{self.courier} -> {self.flat_number} ({self.status})"

class StaffPass(models.Model):
    class Role(models.TextChoices):
        MAID = "maid", "Maid"
        COOK = "cook", "Cook"
        DRIVER = "driver", "Driver"
        NANNY = "nanny", "Nanny"
        OTHER = "other", "Other"

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="staff_passes")
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.OTHER)
    valid_till = models.DateField()
    qr_code = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.role}) -> {self.owner}"