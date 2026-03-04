from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AllergyTagViewSet, MealViewSet

router = DefaultRouter()
router.register("", MealViewSet, basename="meal")
router.register("allergy-tags", AllergyTagViewSet, basename="allergy-tag")

urlpatterns = [
    path("", include(router.urls)),
]
