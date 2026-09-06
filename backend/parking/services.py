from django.db import transaction
from .models import ParkingSlot


class NoAvailableSlotError(Exception):
    pass


def allocate_slot_for_vehicle(vehicle):
    with transaction.atomic():
        slot = (
            ParkingSlot.objects
            .select_for_update()
            .filter(status=ParkingSlot.Status.AVAILABLE)
            .order_by("code")
            .first()
        )
        if slot is None:
            raise NoAvailableSlotError("No available parking slots right now.")

        slot.status = ParkingSlot.Status.OCCUPIED
        slot.save()
        vehicle.slot = slot
        vehicle.status = vehicle.Status.ACTIVE
        vehicle.save()
        return slot


def release_slot(vehicle):
    with transaction.atomic():
        slot = vehicle.slot
        if slot is None:
            return
        vehicle.slot = None
        vehicle.status = vehicle.Status.PENDING
        vehicle.save()
        slot.status = ParkingSlot.Status.AVAILABLE
        slot.save()