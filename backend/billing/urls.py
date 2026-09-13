from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import MaintenanceFeeViewSet, SocietyTransactionViewSet
from .webhooks import PaymentWebhookView

router = DefaultRouter()
router.register("fees", MaintenanceFeeViewSet, basename="maintenance-fee")
router.register("transactions", SocietyTransactionViewSet, basename="society-transaction")

urlpatterns = [
    path("webhook/", PaymentWebhookView.as_view(), name="payment-webhook"),
    path("", include(router.urls)),
]