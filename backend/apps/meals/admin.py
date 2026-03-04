from django.contrib import admin
from .models import AllergyTag, Meal


@admin.register(AllergyTag)
class AllergyTagAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Meal)
class MealAdmin(admin.ModelAdmin):
    list_display = (
        "title", "posted_by", "discounted_price", "quantity_remaining",
        "status", "pickup_start", "expiry_time",
    )
    list_filter = ("status",)
    search_fields = ("title", "posted_by__email", "posted_by__business_name")
    readonly_fields = ("created_at", "updated_at")
    filter_horizontal = ("allergy_tags",)
