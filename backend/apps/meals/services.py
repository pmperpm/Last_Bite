def publish_meal(meal):
    """Business logic: publish a meal."""
    meal.status = meal.Status.AVAILABLE
    meal.save(update_fields=["status"])

def cancel_meal(meal):
    """Business logic: cancel a meal."""
    meal.status = meal.Status.CANCELLED
    meal.save(update_fields=["status"])
