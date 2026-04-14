from django.utils import timezone
from apps.meals.models import Meal

def confirm_received(booking):
    """User confirms they have received the food."""
    if booking.status != booking.Status.READY_FOR_PICKUP:
        raise ValueError("Booking is not ready for pickup yet.")
    booking.user_confirmed_received = True
    booking.status = booking.Status.COMPLETED
    booking.completed_at = timezone.now()
    booking.save(update_fields=["user_confirmed_received", "status", "completed_at"])

def confirm_payment(booking):
    """Business confirms the payment slip — moves to CONFIRMED."""
    if booking.status != booking.Status.PENDING:
        raise ValueError("Booking is not in pending state.")
        
    booking.status = booking.Status.CONFIRMED
    booking.confirmed_at = timezone.now()
    # Decrement meal quantity
    meal = booking.meal
    meal.quantity_remaining -= booking.quantity
    if meal.quantity_remaining <= 0:
        meal.status = Meal.Status.SOLD_OUT
    meal.save(update_fields=["quantity_remaining", "status"])
    booking.save(update_fields=["status", "confirmed_at"])

def mark_ready(booking):
    """Business marks food as ready for pickup."""
    if booking.status != booking.Status.CONFIRMED:
        raise ValueError("Booking must be confirmed before marking ready.")
    booking.status = booking.Status.READY_FOR_PICKUP
    booking.ready_at = timezone.now()
    booking.save(update_fields=["status", "ready_at"])

def finish(booking):
    """Business marks the booking as fully finished."""
    if booking.status != booking.Status.COMPLETED:
        raise ValueError("User has not confirmed receipt yet.")
    booking.business_marked_finished = True
    booking.save(update_fields=["business_marked_finished"])

def cancel(booking, reason=""):
    """Cancel a booking."""
    if booking.status in [booking.Status.COMPLETED, booking.Status.CANCELLED]:
        raise ValueError("Cannot cancel a completed or already cancelled booking.")
    booking.status = booking.Status.CANCELLED
    booking.cancelled_at = timezone.now()
    booking.cancellation_reason = reason
    booking.save(update_fields=["status", "cancelled_at", "cancellation_reason"])
