from django.conf import settings
from django.db import models


class AllergyTag(models.Model):
    """Pre-defined allergy / dietary tags (e.g. Gluten-free, Vegan, Nut)."""

    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "allergy_tags"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Meal(models.Model):
    """
    A leftover meal listing posted by a business owner.

    Lifecycle: draft → available → sold_out / expired / cancelled
    """

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        AVAILABLE = "available", "Available"
        SOLD_OUT = "sold_out", "Sold Out"
        EXPIRED = "expired", "Expired"
        CANCELLED = "cancelled", "Cancelled"

    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="meals",
        limit_choices_to={"role": "business_owner"},
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="meals/", null=True, blank=True)

    # Pricing
    original_price = models.DecimalField(max_digits=8, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=8, decimal_places=2)

    # Availability
    quantity_total = models.PositiveIntegerField(default=1)
    quantity_remaining = models.PositiveIntegerField(default=1)

    # Nutrition info
    calories = models.PositiveIntegerField(null=True, blank=True, help_text="kcal")
    protein_g = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    carbs_g = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    fat_g = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    # Allergy / dietary info
    allergy_tags = models.ManyToManyField(AllergyTag, blank=True, related_name="meals")
    allergy_notes = models.TextField(blank=True, help_text="Free-text allergy notes")

    # Time window
    pickup_start = models.DateTimeField()
    pickup_end = models.DateTimeField()
    expiry_time = models.DateTimeField(help_text="Food must be picked up before this time")

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "meals"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} by {self.posted_by.business_name or self.posted_by.email}"

    @property
    def is_available(self):
        return self.status == self.Status.AVAILABLE and self.quantity_remaining > 0

    @property
    def discount_percent(self):
        if self.original_price > 0:
            return round((1 - self.discounted_price / self.original_price) * 100, 1)
        return 0