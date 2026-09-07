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

from .models import Amenity, AmenityBooking


class SlotAlreadyBookedError(Exception):
    pass


def create_amenity_booking(amenity_id, resident, date, slot):
    """Same locking pattern as allocate_slot_for_vehicle: lock the amenity
    row first, so two residents booking the same slot at the same instant
    can't both succeed. The second request waits for the first to commit,
    then correctly sees the slot as taken."""
    with transaction.atomic():
        amenity = Amenity.objects.select_for_update().get(id=amenity_id)

        conflict = AmenityBooking.objects.filter(amenity=amenity, date=date, slot=slot).exists()
        if conflict:
            raise SlotAlreadyBookedError("That slot is already booked — pick a different time.")

        return AmenityBooking.objects.create(amenity=amenity, resident=resident, date=date, slot=slot)