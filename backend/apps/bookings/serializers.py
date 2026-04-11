from django.utils import timezone
from rest_framework import serializers
from django.db import transaction
from apps.meals.models import Meal
from apps.meals.serializers import MealListSerializer
from .models import Booking


class BookingCreateSerializer(serializers.ModelSerializer):
    """Used when a student/worker creates a booking."""

    class Meta:
        model = Booking
        fields = ["id", "meal", "quantity"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        # Lock the meal row so no concurrent booking can read a stale quantity
        meal = Meal.objects.get(pk=attrs["meal"].pk)
        attrs["meal"] = meal
        quantity = attrs.get("quantity", 1)

        if not meal.is_available:
            raise serializers.ValidationError("This meal is no longer available.")
        if quantity > meal.quantity_remaining:
            raise serializers.ValidationError(
                f"Only {meal.quantity_remaining} portion(s) left."
            )
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            meal = Meal.objects.select_for_update().get(pk=validated_data["meal"].pk)
            if not meal.is_available or validated_data["quantity"] > meal.quantity_remaining:
                raise serializers.ValidationError("Meal no longer available.")
            validated_data["meal"] = meal
            validated_data["total_price"] = meal.discounted_price * validated_data["quantity"]
            validated_data["user"] = self.context["request"].user
            return super().create(validated_data)


class BookingSerializer(serializers.ModelSerializer):
    """Full read serializer for bookings."""
    meal = MealListSerializer(read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "user_email",
            "user_full_name",
            "meal",
            "quantity",
            "total_price",
            "status",
            "confirmed_at",
            "ready_at",
            "completed_at",
            "cancelled_at",
            "cancellation_reason",
            "user_confirmed_received",
            "business_marked_finished",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
