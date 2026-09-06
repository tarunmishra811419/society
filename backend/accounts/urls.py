from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MeView, RegisterResidentView, LoginView, MoveRequestViewSet

router = DefaultRouter()
router.register("move-requests", MoveRequestViewSet, basename="move-request")

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("register/resident/", RegisterResidentView.as_view(), name="register-resident"),
    path("login/", LoginView.as_view(), name="login"),
    path("login/refresh/", TokenRefreshView.as_view(), name="login-refresh"),
    path("", include(router.urls)),
]