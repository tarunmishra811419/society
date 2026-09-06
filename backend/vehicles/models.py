from django.conf import settings
from django.db import models


class Vehicle(models.Model):
    class VehicleType(models.TextChoices):
        CAR = "car", "Car"
        TWO_WHEELER = "two_wheeler", "Two-wheeler"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="vehicles"
    )
    plate = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=20, choices=VehicleType.choices, default=VehicleType.CAR)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    slot = models.OneToOneField(
        "parking.ParkingSlot", on_delete=models.SET_NULL, null=True, blank=True, related_name="vehicle"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.plate} ({self.owner})"