from rest_framework.routers import DefaultRouter
from .views import ParkingSlotViewSet

router = DefaultRouter()
router.register("slots", ParkingSlotViewSet, basename="parking-slot")

urlpatterns = router.urls