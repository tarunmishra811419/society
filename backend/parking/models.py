from django.db import models


class ParkingSlot(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        OCCUPIED = "occupied", "Occupied"
        RESERVED = "reserved", "Reserved"

    code = models.CharField(max_length=10, unique=True)  # e.g. "B-12"
    block = models.CharField(max_length=5)  # e.g. "B"
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)

    def __str__(self):
        return self.code

    class Meta:
        ordering = ["code"]