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
