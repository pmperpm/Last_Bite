from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import MealFilter
from .models import AllergyTag, Meal
from .permissions import IsBusinessOwner, IsOwnerOrAdmin
from .serializers import AllergyTagSerializer, MealDetailSerializer, MealListSerializer


class AllergyTagViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/v1/meals/allergy-tags/ — public list of allergy tags."""
    queryset = AllergyTag.objects.all()
    serializer_class = AllergyTagSerializer
    permission_classes = [permissions.AllowAny]


class MealViewSet(viewsets.ModelViewSet):
    """
    CRUD for meal listings.

    - Anyone (authenticated) can browse available meals.
    - Only business owners can create/update/delete their own meals.
    """

    queryset = Meal.objects.select_related("posted_by").prefetch_related("allergy_tags")
    filterset_class = MealFilter
    search_fields = ["title", "description", "posted_by__business_name"]
    ordering_fields = ["discounted_price", "pickup_start", "created_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return MealListSerializer
        return MealDetailSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsBusinessOwner()]
        if self.action in ["publish", "cancel"]:
            return [permissions.IsAuthenticated(), IsBusinessOwner()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        # Non-business users can only see available meals
        user = self.request.user
        if user.role == "business_owner":
            return qs.filter(posted_by=user)
        if user.is_staff:
            return qs
        return qs.filter(status=Meal.Status.AVAILABLE)

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

    def create(self, request, *args, **kwargs):
        print("REQUEST DATA:", request.data)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("SERIALIZER ERRORS:", serializer.errors)
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        """POST /api/v1/meals/<id>/publish/ — make a meal available."""
        meal = self.get_object()
        meal.mark_published()
        return Response({"status": "published"})

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """POST /api/v1/meals/<id>/cancel/"""
        meal = self.get_object()
        meal.mark_cancelled()
        return Response({"status": "cancelled"})
