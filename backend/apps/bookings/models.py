from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.meals.models import Meal


class Booking(models.Model):
    """
    A reservation made by a student/worker for a specific meal.

    Workflow:
      pending → confirmed → ready_for_pickup → completed
                         ↘ cancelled (by user or business)
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"                          # just created, awaiting payment
        CONFIRMED = "confirmed", "Confirmed"                    # payment verified by business
        READY_FOR_PICKUP = "ready_for_pickup", "Ready for Pickup"
        COMPLETED = "completed", "Completed"                    # user clicked "received"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
        limit_choices_to={"role": "student_worker"},
    )
    meal = models.ForeignKey(
        Meal,
        on_delete=models.CASCADE,
        related_name="bookings",
    )

    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=8, decimal_places=2)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    # Timestamps for each status transition
    confirmed_at = models.DateTimeField(null=True, blank=True)
    ready_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)

    # User confirms they received the food
    user_confirmed_received = models.BooleanField(default=False)
    # Business marks the booking as finished
    business_marked_finished = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bookings"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Booking #{self.pk} — {self.user.email} → {self.meal.title} [{self.status}]"

    def confirm_received(self):
        """User confirms they have received the food."""
        if self.status != self.Status.READY_FOR_PICKUP:
            raise ValueError("Booking is not ready for pickup yet.")
        self.user_confirmed_received = True
        self.status = self.Status.COMPLETED
        self.completed_at = timezone.now()
        self.save(update_fields=["user_confirmed_received", "status", "completed_at"])

    def confirm_payment(self):
        """Business confirms the payment slip — moves to CONFIRMED."""
        if self.status != self.Status.PENDING:
            raise ValueError("Booking is not in pending state.")
            
        self.status = self.Status.CONFIRMED
        self.confirmed_at = timezone.now()
        # Decrement meal quantity
        meal = self.meal
        meal.quantity_remaining -= self.quantity
        if meal.quantity_remaining <= 0:
            meal.status = Meal.Status.SOLD_OUT
        meal.save(update_fields=["quantity_remaining", "status"])
        self.save(update_fields=["status", "confirmed_at"])

    def mark_ready(self):
        """Business marks food as ready for pickup."""
        if self.status != self.Status.CONFIRMED:
            raise ValueError("Booking must be confirmed before marking ready.")
        self.status = self.Status.READY_FOR_PICKUP
        self.ready_at = timezone.now()
        self.save(update_fields=["status", "ready_at"])

    def finish(self):
        """Business marks the booking as fully finished."""
        if self.status != self.Status.COMPLETED:
            raise ValueError("User has not confirmed receipt yet.")
        self.business_marked_finished = True
        self.save(update_fields=["business_marked_finished"])

    def cancel(self, reason=""):
        """Cancel a booking."""
        if self.status in [self.Status.COMPLETED, self.Status.CANCELLED]:
            raise ValueError("Cannot cancel a completed or already cancelled booking.")
        self.status = self.Status.CANCELLED
        self.cancelled_at = timezone.now()
        self.cancellation_reason = reason
        self.save(update_fields=["status", "cancelled_at", "cancellation_reason"])
