from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.bookings.models import Booking


class Payment(models.Model):
    """
    Payment record attached to a booking.

    Flow:
      uploaded → verified → rejected
    """

    class Status(models.TextChoices):
        UPLOADED = "uploaded", "Slip Uploaded"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name="payment",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments",
    )

    amount = models.DecimalField(max_digits=8, decimal_places=2)

    # Slip image uploaded by the user
    slip_image = models.ImageField(upload_to="payment_slips/")

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UPLOADED,
    )

    rejection_reason = models.TextField(blank=True)

    # Who verified / rejected and when
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="verified_payments",
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment #{self.pk} : Booking #{self.booking_id} [{self.status}]"
