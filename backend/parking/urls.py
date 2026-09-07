from rest_framework.routers import DefaultRouter
from .views import ParkingSlotViewSet, AmenityViewSet, AmenityBookingViewSet

router = DefaultRouter()
router.register("slots", ParkingSlotViewSet, basename="parking-slot")
router.register("amenities", AmenityViewSet, basename="amenity")
router.register("amenity-bookings", AmenityBookingViewSet, basename="amenity-booking")

urlpatterns = router.urls