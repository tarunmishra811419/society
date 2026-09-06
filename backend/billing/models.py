from django.conf import settings
from django.db import models


class MaintenanceFee(models.Model):
    class Status(models.TextChoices):
        DUE = "due", "Due"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"

    resident = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="maintenance_fees"
    )
    period = models.CharField(max_length=20)  # e.g. "September 2026"
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DUE)
    paid_on = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)

    class Meta:
        unique_together = ["resident", "period"]
        ordering = ["-id"]

    def __str__(self):
        return f"{self.resident} - {self.period} ({self.status})"