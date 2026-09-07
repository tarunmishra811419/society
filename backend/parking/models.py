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

class Amenity(models.Model):
    name = models.CharField(max_length=100)
    capacity = models.CharField(max_length=50)
    slot_length = models.CharField(max_length=50)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class AmenityBooking(models.Model):
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE, related_name="bookings")
    resident = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="amenity_bookings")
    date = models.DateField()
    slot = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["amenity", "date", "slot"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.amenity} - {self.date} {self.slot} ({self.resident})"