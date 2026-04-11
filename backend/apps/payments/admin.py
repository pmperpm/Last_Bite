from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id", "user", "booking", "amount",
        "status", "verified_by", "verified_at", "created_at",
    )
    list_filter = ("status",)
    search_fields = ("user__email", "booking__meal__title")
    readonly_fields = ("created_at", "updated_at", "verified_at")
