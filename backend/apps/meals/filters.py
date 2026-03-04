import django_filters
from .models import Meal


class MealFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="discounted_price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="discounted_price", lookup_expr="lte")
    allergy_tag = django_filters.CharFilter(field_name="allergy_tags__name", lookup_expr="icontains")
    status = django_filters.ChoiceFilter(choices=Meal.Status.choices)

    class Meta:
        model = Meal
        fields = ["status", "min_price", "max_price", "allergy_tag"]
