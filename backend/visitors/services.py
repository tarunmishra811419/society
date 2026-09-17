import secrets
from django.utils import timezone
from .models import Visitor, GuestApproval


def generate_qr_code():
    return f"QR-{secrets.token_hex(4).upper()}"


def generate_entry_otp():
    """Generates a secure, readable 4-digit numerical OTP for hardware-free gate check-in."""
    return f"{secrets.randbelow(9000) + 1000}"


def approve_guest(guest_approval: GuestApproval):
    if guest_approval.status != GuestApproval.Status.PENDING:
        raise ValueError("This request has already been decided.")

    visitor = Visitor.objects.create(
        name=guest_approval.visitor_name,
        phone=guest_approval.phone,
        purpose=guest_approval.purpose or "Guest visit",
        vehicle_number=guest_approval.vehicle_number,
        expected_date=guest_approval.expected_date,
        host=guest_approval.requested_by,
        qr_code=generate_qr_code(),
        otp=generate_entry_otp(),
        status=Visitor.Status.APPROVED,
    )
    guest_approval.status = GuestApproval.Status.APPROVED
    guest_approval.visitor = visitor
    guest_approval.save()
    return visitor


class InvalidQRCodeError(Exception):
    pass


class AlreadyCheckedInError(Exception):
    pass


def check_in_visitor(code: str, gate: str = "Main Gate"):
    """Accepts either a QR code string (e.g. 'QR-8891'), a 4-digit numerical OTP, or visitor phone number."""
    code_cleaned = code.strip()

    # Search by QR code, OTP, or phone
    visitor = (
        Visitor.objects.filter(qr_code__iexact=code_cleaned).first()
        or Visitor.objects.filter(otp=code_cleaned).first()
        or Visitor.objects.filter(phone=code_cleaned).first()
    )

    if not visitor:
        raise InvalidQRCodeError("No active pass found matching that code or OTP.")

    if visitor.status == Visitor.Status.CHECKED_IN:
        raise AlreadyCheckedInError(f"{visitor.name} is already checked in.")

    visitor.status = Visitor.Status.CHECKED_IN
    visitor.checked_in_at = timezone.now()
    visitor.entry_gate = gate
    visitor.save()
    return visitor


def check_out_visitor(visitor_id: int):
    try:
        visitor = Visitor.objects.get(id=visitor_id)
    except Visitor.DoesNotExist:
        raise InvalidQRCodeError("Visitor record not found.")

    if visitor.status == Visitor.Status.CHECKED_OUT:
        raise ValueError(f"{visitor.name} is already checked out.")

    visitor.status = Visitor.Status.CHECKED_OUT
    visitor.checked_out_at = timezone.now()
    visitor.save()
    return visitor


def generate_staff_qr_code():
    """Staff passes use a distinct prefix (SQR- vs QR-) so gate staff can
    tell at a glance whether a pass is a one-time guest QR or a recurring
    staff QR without needing to look it up."""
    return f"SQR-{secrets.token_hex(4).upper()}"


def generate_qr_image_data_url(code: str) -> str:
    """Renders the given code as an actual scannable QR image, returned as
    a base64 data URL — the frontend can drop this straight into an <img
    src="..."> with no separate file download or media storage needed."""
    import qrcode
    import io
    import base64

    img = qrcode.make(code)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"