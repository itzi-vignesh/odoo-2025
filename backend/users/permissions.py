from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Admin has all permissions
        if request.user.is_authenticated and request.user.role == 'admin':
            return True
            
        # Object must have a user attribute that matches the request user
        return obj == request.user

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'
