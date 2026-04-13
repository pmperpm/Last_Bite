from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AllergyTagViewSet, MealViewSet

router = DefaultRouter()
router.register("allergy-tags", AllergyTagViewSet, basename="allergy-tag")
router.register("", MealViewSet, basename="meal")

urlpatterns = [
    path("", include(router.urls)),
]
