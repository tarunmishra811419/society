from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied

from .models import Visitor, GuestApproval, Package, StaffPass
from .serializers import (
    VisitorSerializer,
    GuestApprovalSerializer,
    CheckInSerializer,
    PackageSerializer,
    StaffPassSerializer,
)
from .permissions import IsHostOrStaff, IsSecurityOrAdmin
from .services import (
    approve_guest,
    check_in_visitor,
    check_out_visitor,
    InvalidQRCodeError,
    AlreadyCheckedInError,
)
from audit.models import AuditLog


class VisitorViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VisitorSerializer
    permission_classes = [permissions.IsAuthenticated, IsHostOrStaff]

    def get_queryset(self):
        user = self.request.user
        queryset = Visitor.objects.select_related("host", "host__resident_profile")
        if user.role in ("admin", "security"):
            return queryset.all()
        return queryset.filter(host=user)

    @action(detail=True, methods=["post"], url_path="check-out", permission_classes=[permissions.IsAuthenticated, IsSecurityOrAdmin])
    def check_out(self, request, pk=None):
        visitor = self.get_object()
        try:
            checked_out = check_out_visitor(visitor.id)
            AuditLog.objects.create(
                actor=request.user,
                action="Checked out visitor",
                target=f"{checked_out.name} ({checked_out.qr_code})",
            )
            return Response(VisitorSerializer(checked_out).data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"], url_path="active-inside")
    def active_inside(self, request):
        user = self.request.user
        qs = Visitor.objects.filter(status=Visitor.Status.CHECKED_IN).select_related("host", "host__resident_profile")
        if user.role not in ("admin", "security"):
            qs = qs.filter(host=user)
        return Response(VisitorSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"], url_path="gate-stats", permission_classes=[permissions.IsAuthenticated, IsSecurityOrAdmin])
    def gate_stats(self, request):
        today = timezone.now().date()
        inside_count = Visitor.objects.filter(status=Visitor.Status.CHECKED_IN).count()
        today_entries = Visitor.objects.filter(checked_in_at__date=today).count()
        today_exits = Visitor.objects.filter(checked_out_at__date=today).count()
        pending_approvals = GuestApproval.objects.filter(status=GuestApproval.Status.PENDING).count()
        waiting_packages = Package.objects.filter(status=Package.Status.WAITING).count()

        return Response({
            "inside_count": inside_count,
            "today_entries": today_entries,
            "today_exits": today_exits,
            "pending_approvals": pending_approvals,
            "waiting_packages": waiting_packages,
        })


class GuestApprovalViewSet(viewsets.ModelViewSet):
    serializer_class = GuestApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = GuestApproval.objects.select_related("requested_by", "requested_by__resident_profile", "visitor")
        if user.role in ("admin", "security"):
            return queryset.all()
        return queryset.filter(requested_by=user)

    def perform_update(self, serializer):
        instance = serializer.instance
        if serializer.validated_data.get("status") == GuestApproval.Status.APPROVED:
            approve_guest(instance)
        else:
            serializer.save()


class VisitorCheckInView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSecurityOrAdmin]

    def post(self, request):
        serializer = CheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data["resolved_code"]
        gate = serializer.validated_data.get("gate", "Main Gate")

        try:
            visitor = check_in_visitor(code, gate=gate)
        except InvalidQRCodeError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except AlreadyCheckedInError as e:
            return Response({"detail": str(e)}, status=status.HTTP_409_CONFLICT)

        return Response(VisitorSerializer(visitor).data, status=status.HTTP_200_OK)


class PackageViewSet(viewsets.ModelViewSet):
    """Security logs packages by flat number. Residents only ever see packages
    logged for their own flat."""
    serializer_class = PackageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("admin", "security"):
            return Package.objects.all()
        flat = getattr(getattr(user, "resident_profile", None), "flat_number", None)
        return Package.objects.filter(flat_number=flat)

    def perform_create(self, serializer):
        if self.request.user.role not in ("security", "admin"):
            raise PermissionDenied("Only security or admin can log a package.")
        serializer.save(has_photo=True)

    @action(detail=True, methods=["post"], url_path="collect")
    def mark_collected(self, request, pk=None):
        package = self.get_object()
        if request.user.role == "resident":
            flat = getattr(getattr(request.user, "resident_profile", None), "flat_number", None)
            if package.flat_number != flat:
                return Response({"detail": "This package is addressed to a different flat."}, status=status.HTTP_403_FORBIDDEN)
        package.status = Package.Status.COLLECTED
        package.collected_at = timezone.now()
        package.save()
        return Response(PackageSerializer(package).data)


class StaffPassViewSet(viewsets.ModelViewSet):
    """Residents create and manage their own staff passes. Security/admin
    can view all to verify at the gate."""
    serializer_class = StaffPassSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("admin", "security"):
            return StaffPass.objects.all()
        return StaffPass.objects.filter(owner=user)

    def perform_create(self, serializer):
        if self.request.user.role != "resident":
            raise PermissionDenied("Only residents can issue staff passes.")
        serializer.save()