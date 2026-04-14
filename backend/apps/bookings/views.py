from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import F

from apps.meals.permissions import IsBusinessOwner, IsStudentWorker
from .models import Booking
from .serializers import BookingCreateSerializer, BookingSerializer
from .services import confirm_received, confirm_payment, mark_ready, finish, cancel
from rest_framework import serializers as drf_serializers


class BookingViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    Booking lifecycle endpoints.

    Student/Worker:
      POST   /api/v1/bookings/          — create booking
      GET    /api/v1/bookings/          — list own bookings
      GET    /api/v1/bookings/<id>/     — retrieve booking
      POST   /api/v1/bookings/<id>/confirm_received/  — mark received

    Business Owner:
      GET    /api/v1/bookings/          — list bookings for their meals
      POST   /api/v1/bookings/<id>/confirm_payment/   — confirm payment
      POST   /api/v1/bookings/<id>/mark_ready/        — mark ready for pickup
      POST   /api/v1/bookings/<id>/finish/            — mark finished
      POST   /api/v1/bookings/<id>/cancel/            — cancel booking
    """

    def get_serializer_class(self):
        if self.action == "create":
            return BookingCreateSerializer
        return BookingSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsStudentWorker()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related("user", "meal", "meal__posted_by")

        if user.is_staff:
            return qs.all()
        if user.role == "business_owner":
            return qs.filter(meal__posted_by=user)
        # student/worker sees only their own
        return qs.filter(user=user)

    # ----------------------------------------------------------------
    # Student/Worker actions
    # ----------------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="confirm_received")
    def confirm_received(self, request, pk=None):
        """Student confirms they have received the food."""
        booking = self.get_object()

        if booking.user != request.user:
            return Response(
                {"detail": "Not your booking."},
                status=status.HTTP_403_FORBIDDEN,
            )
            
        try:
            confirm_received(booking)
            return Response({"status": "completed"})
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    # ----------------------------------------------------------------
    # Business Owner actions
    # ----------------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="confirm_payment",
            permission_classes=[permissions.IsAuthenticated, IsBusinessOwner])
    def confirm_payment(self, request, pk=None):
        """Business confirms the payment slip — moves to CONFIRMED."""
        booking = self.get_object()

        try:
            confirm_payment(booking)
            return Response({"status": "confirmed"})
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"], url_path="mark_ready",
            permission_classes=[permissions.IsAuthenticated, IsBusinessOwner])
    def mark_ready(self, request, pk=None):
        """Business marks food as ready for pickup."""
        booking = self.get_object()

        try:
            mark_ready(booking)
            return Response({"status": "ready_for_pickup"})
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"], url_path="finish",
            permission_classes=[permissions.IsAuthenticated, IsBusinessOwner])
    def finish(self, request, pk=None):
        """Business marks the booking as fully finished."""
        booking = self.get_object()

        try:
            finish(booking)
            return Response({"status": "finished"})
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        """Cancel a booking (user or business owner)."""
        booking = self.get_object()
        reason = request.data.get("reason", "")
        
        try:
            cancel(booking, reason=reason)
            return Response({"status": "cancelled"})
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
