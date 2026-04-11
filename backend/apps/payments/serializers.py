from rest_framework import serializers

from .models import Payment


class PaymentUploadSerializer(serializers.ModelSerializer):
    """Used when a student/worker uploads a payment slip."""

    class Meta:
        model = Payment
        fields = ["id", "booking", "slip_image"]
        read_only_fields = ["id"]

    def validate_booking(self, booking):
        request = self.context["request"]
        if booking.user != request.user:
            raise serializers.ValidationError("This booking does not belong to you.")
        if hasattr(booking, "payment"):
            raise serializers.ValidationError("A payment slip has already been uploaded for this booking.")
        return booking

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        validated_data["amount"] = validated_data["booking"].total_price
        return super().create(validated_data)


class PaymentSerializer(serializers.ModelSerializer):
    """Full read serializer for payments."""
    user_email = serializers.EmailField(source="user.email", read_only=True)
    booking_id = serializers.IntegerField(source="booking.id", read_only=True)
    meal_title = serializers.CharField(source="booking.meal.title", read_only=True)
    verified_by_email = serializers.EmailField(source="verified_by.email", read_only=True, allow_null=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "booking_id",
            "meal_title",
            "user_email",
            "amount",
            "slip_image",
            "status",
            "rejection_reason",
            "verified_by_email",
            "verified_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
