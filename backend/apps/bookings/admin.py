from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id", "user", "meal", "quantity", "total_price",
        "status", "created_at",
    )
    list_filter = ("status",)
    search_fields = ("user__email", "meal__title")
    readonly_fields = (
        "confirmed_at", "ready_at", "completed_at",
        "cancelled_at", "created_at", "updated_at",
    )
