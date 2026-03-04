from rest_framework import permissions


class IsBusinessOwner(permissions.BasePermission):
    """Allow access only to users with the business_owner role."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "business_owner")


class IsOwnerOrAdmin(permissions.BasePermission):
    """Object-level: allow access to the owner of the object or admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        # obj.posted_by for meals; obj.user for bookings/payments
        owner = getattr(obj, "posted_by", None) or getattr(obj, "user", None)
        return owner == request.user


class IsStudentWorker(permissions.BasePermission):
    """Allow access only to student / worker users."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "student_worker")
