from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with a role. Role-specific fields live in the profile
    models below rather than crowding this table."""

    class Role(models.TextChoices):
        RESIDENT = "resident", "Resident"
        SECURITY = "security", "Security"
        ADMIN = "admin", "Admin"

    role = models.CharField(max_length=20, choices=Role.choices)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"


class ResidentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="resident_profile")
    flat_number = models.CharField(max_length=20, unique=True)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.user} — {self.flat_number}"


class SecurityProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="security_profile")
    gate = models.CharField(max_length=50, default="Main Gate")
    shift = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.user} — {self.gate}"


class MoveRequest(models.Model):
    class MoveType(models.TextChoices):
        MOVE_IN = "move_in", "Move in"
        MOVE_OUT = "move_out", "Move out"

    flat_number = models.CharField(max_length=20)
    resident_name = models.CharField(max_length=150)
    move_type = models.CharField(max_length=10, choices=MoveType.choices)
    requested_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.resident_name} - {self.flat_number} ({self.move_type})"


class MoveRequestChecklistItem(models.Model):
    move_request = models.ForeignKey(MoveRequest, on_delete=models.CASCADE, related_name="checklist")
    label = models.CharField(max_length=200)
    done = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.label   