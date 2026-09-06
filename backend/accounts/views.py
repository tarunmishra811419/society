from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, MoveRequest, MoveRequestChecklistItem
from .serializers import UserSerializer, RegisterResidentSerializer, MoveRequestSerializer
from .permissions import IsAdminRole


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class RegisterResidentView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterResidentSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    pass


class MoveRequestViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only: move requests and their checklists are managed via the
    'toggle' action below and Django admin, not general CRUD."""
    queryset = MoveRequest.objects.prefetch_related("checklist").all().order_by("-created_at")
    serializer_class = MoveRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    @action(detail=True, methods=["post"], url_path="checklist/(?P<item_id>[^/.]+)/toggle")
    def toggle_checklist_item(self, request, pk=None, item_id=None):
        move_request = self.get_object()
        try:
            item = move_request.checklist.get(id=item_id)
        except MoveRequestChecklistItem.DoesNotExist:
            return Response({"detail": "Checklist item not found."}, status=404)
        item.done = not item.done
        item.save()

        # Re-fetch to avoid returning move_request's stale prefetched
        # checklist cache from get_object()'s queryset — without this the
        # response would silently show the old, un-toggled state.
        move_request = MoveRequest.objects.prefetch_related("checklist").get(pk=move_request.pk)
        return Response(MoveRequestSerializer(move_request).data)