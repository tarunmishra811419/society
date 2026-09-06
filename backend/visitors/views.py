from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied

from .models import Visitor, GuestApproval, Package, StaffPass 
from .serializers import VisitorSerializer, GuestApprovalSerializer, CheckInSerializer, PackageSerializer, StaffPassSerializer
from .permissions import IsHostOrStaff, IsSecurityOrAdmin
from .services import approve_guest, check_in_visitor, InvalidQRCodeError, AlreadyCheckedInError


class VisitorViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VisitorSerializer
    permission_classes = [permissions.IsAuthenticated, IsHostOrStaff]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("admin", "security"):
            return Visitor.objects.all().order_by("-created_at")
        return Visitor.objects.filter(host=user).order_by("-created_at")


class GuestApprovalViewSet(viewsets.ModelViewSet):
    serializer_class = GuestApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("admin", "security"):
            return GuestApproval.objects.all().order_by("-created_at")
        return GuestApproval.objects.filter(requested_by=user).order_by("-created_at")

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
        try:
            visitor = check_in_visitor(serializer.validated_data["qr_code"])
        except InvalidQRCodeError as e:
            return Response({"detail": str(e)}, status=404)
        except AlreadyCheckedInError as e:
            return Response({"detail": str(e)}, status=409)
        return Response(VisitorSerializer(visitor).data, status=200)


class PackageViewSet(viewsets.ModelViewSet):
    """Security logs packages by flat number (not tied to a resident
    account directly, since who's home to receive it can vary). Residents
    only ever see packages logged for their own flat."""
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
            raise PermissionDenied("Only security can log a package.")
        serializer.save(has_photo=True)

    @action(detail=True, methods=["post"], url_path="collect")
    def mark_collected(self, request, pk=None):
        package = self.get_object()
        if request.user.role == "resident":
            flat = getattr(getattr(request.user, "resident_profile", None), "flat_number", None)
            if package.flat_number != flat:
                return Response({"detail": "This isn't your package."}, status=403)
        package.status = Package.Status.COLLECTED
        package.save()
        return Response(PackageSerializer(package).data)

class StaffPassViewSet(viewsets.ModelViewSet):
    """Residents create and manage their own staff passes. Security/admin
    can view all (to verify at the gate) but never create one on a
    resident's behalf via the API."""
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