from django.conf import settings
from django.db import models


class MaintenanceFee(models.Model):
    class Status(models.TextChoices):
        DUE = "due", "Due"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"

    class PaymentMethod(models.TextChoices):
        UPI = "upi", "UPI"
        CARD = "card", "Credit / Debit Card"
        NET_BANKING = "net_banking", "Net Banking"
        CASH = "cash", "Cash / Cheque"

    resident = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="maintenance_fees"
    )
    period = models.CharField(max_length=50)  # e.g. "September 2026"
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DUE)
    due_date = models.DateField(null=True, blank=True)
    paid_on = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    payment_method = models.CharField(
        max_length=30, choices=PaymentMethod.choices, default=PaymentMethod.CARD, blank=True
    )
    receipt_number = models.CharField(max_length=50, blank=True, null=True, unique=True)
    breakdown_json = models.JSONField(default=dict, blank=True)
    last_reminder_sent = models.DateTimeField(null=True, blank=True)
    reminder_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ["resident", "period"]
        ordering = ["-id"]

    def __str__(self):
        return f"{self.resident} - {self.period} ({self.status})"


class SocietyTransaction(models.Model):
    class EntryType(models.TextChoices):
        INCOME = "income", "Income"
        EXPENSE = "expense", "Expense"

    class Category(models.TextChoices):
        # Income categories
        MAINTENANCE = "maintenance", "Maintenance Collections"
        FACILITY = "facility", "Facility Booking"
        PENALTY = "penalty", "Late Fees / Penalties"
        OTHER_INCOME = "other_income", "Other Income"

        # Expense categories
        SECURITY = "security", "Security Staff & Guards"
        HOUSEKEEPING = "housekeeping", "Housekeeping & Sanitation"
        UTILITIES = "utilities", "Electricity & Water Bills"
        REPAIRS = "repairs", "Lift & Electrical Repairs"
        GARDENING = "gardening", "Landscaping & Gardening"
        ADMIN = "admin", "Administrative & Audit"
        OTHER_EXPENSE = "other_expense", "Other Expense"

    entry_type = models.CharField(max_length=20, choices=EntryType.choices)
    category = models.CharField(max_length=50, choices=Category.choices)
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True)
    reference_no = models.CharField(max_length=100, blank=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_transactions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"[{self.entry_type.upper()}] {self.title} - ₹{self.amount} on {self.date}"