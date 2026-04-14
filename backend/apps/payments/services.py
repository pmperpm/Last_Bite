from django.utils import timezone
from apps.bookings.services import confirm_payment

def verify_payment(payment, user):
    """Business logic to verify a payment slip."""
    if payment.status != payment.Status.UPLOADED:
        raise ValueError("Payment is not in uploaded state.")

    payment.status = payment.Status.VERIFIED
    payment.verified_by = user
    payment.verified_at = timezone.now()
    payment.save(update_fields=["status", "verified_by", "verified_at"])

    # Trigger booking confirmation automatically
    confirm_payment(payment.booking)

def reject_payment(payment, user, reason=""):
    """Business logic to reject a payment slip."""
    if payment.status != payment.Status.UPLOADED:
        raise ValueError("Payment is not in uploaded state.")

    payment.status = payment.Status.REJECTED
    payment.rejection_reason = reason
    payment.verified_by = user
    payment.verified_at = timezone.now()
    payment.save(update_fields=["status", "rejection_reason", "verified_by", "verified_at"])
