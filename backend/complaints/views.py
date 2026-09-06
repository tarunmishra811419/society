from rest_framework import viewsets, permissions
from .models import Complaint
from .serializers import ComplaintSerializer
from .permissions import IsOwnerOrStaff


class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Complaint.objects.all()
        return Complaint.objects.filter(raised_by=user)