from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import VisitorViewSet, GuestApprovalViewSet, VisitorCheckInView, PackageViewSet, StaffPassViewSet

router = DefaultRouter()
router.register("passes", VisitorViewSet, basename="visitor")
router.register("guest-approvals", GuestApprovalViewSet, basename="guest-approval")
router.register("packages", PackageViewSet, basename="package")
router.register("staff-passes", StaffPassViewSet, basename="staff-pass")

urlpatterns = [
    path("check-in/", VisitorCheckInView.as_view(), name="visitor-check-in"),
    path("", include(router.urls)),
]