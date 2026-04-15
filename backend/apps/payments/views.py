from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.meals.permissions import IsBusinessOwner, IsStudentWorker
from .models import Payment
from .serializers import PaymentSerializer, PaymentUploadSerializer
from .services import verify_payment, reject_payment


class PaymentViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):  

    def get_serializer_class(self):
        if self.action == "create":
            return PaymentUploadSerializer
        return PaymentSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsStudentWorker()]
        if self.action in ["verify", "reject"]:
            return [permissions.IsAuthenticated(), IsBusinessOwner()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Payment.objects.select_related(
            "user", "booking", "booking__meal", "verified_by"
        )
        if user.is_staff:
            return qs.all()
        if user.role == "business_owner":
            return qs.filter(booking__meal__posted_by=user)
        return qs.filter(user=user)

    # Business Owner actions

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        """Business owner verifies the payment slip."""
        payment = self.get_object()

        try:
            verify_payment(payment, user=request.user)
            return Response({"status": "verified"})
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        """Business owner rejects the payment slip."""
        payment = self.get_object()
        reason = request.data.get("reason", "")

        try:
            reject_payment(payment, user=request.user, reason=reason)
            return Response({"status": "rejected"})
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
