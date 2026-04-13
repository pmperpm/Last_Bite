from rest_framework import serializers

from .models import AllergyTag, Meal


class AllergyTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = AllergyTag
        fields = ["id", "name"]


class MealListSerializer(serializers.ModelSerializer):
    """Compact representation used in list endpoints."""
    posted_by_name = serializers.CharField(source="posted_by.business_name", read_only=True)
    discount_percent = serializers.FloatField(read_only=True)
    allergy_tags = AllergyTagSerializer(many=True, read_only=True)

    class Meta:
        model = Meal
        fields = [
            "id",
            "title",
            "image",
            "discounted_price",
            "original_price",
            "discount_percent",
            "quantity_remaining",
            "pickup_start",
            "pickup_end",
            "status",
            "posted_by_name",
            "allergy_tags",
        ]


class MealDetailSerializer(serializers.ModelSerializer):
    """Full representation used in retrieve / create / update."""
    posted_by_name = serializers.CharField(source="posted_by.business_name", read_only=True)
    posted_by_id = serializers.IntegerField(source="posted_by.id", read_only=True)
    discount_percent = serializers.FloatField(read_only=True)
    allergy_tags = AllergyTagSerializer(many=True, read_only=True)
    allergy_tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=AllergyTag.objects.all(),
        many=True,
        write_only=True,
        source="allergy_tags",
        required=False,
    )

    class Meta:
        model = Meal
        fields = [
            "id",
            "posted_by_id",
            "posted_by_name",
            "title",
            "description",
            "image",
            "original_price",
            "discounted_price",
            "discount_percent",
            "quantity_total",
            "quantity_remaining",
            "calories",
            "protein_g",
            "carbs_g",
            "fat_g",
            "allergy_tags",
            "allergy_tag_ids",
            "allergy_notes",
            "pickup_start",
            "pickup_end",
            "expiry_time",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "posted_by_id", "posted_by_name", "quantity_remaining", "created_at", "updated_at"]
