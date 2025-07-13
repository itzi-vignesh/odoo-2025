from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Notification
from .serializers import NotificationSerializer, NotificationUpdateSerializer
from users.permissions import IsOwnerOrAdmin, IsAdminUser
from django.contrib.auth import get_user_model

class NotificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing notifications
    """
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    serializer_class = NotificationSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return NotificationUpdateSerializer
        return NotificationSerializer
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"status": "success"}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get only unread notifications"""
        unread = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(unread, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def broadcast(self, request):
        """Admin: Send a platform-wide notification to all active users."""
        User = get_user_model()
        title = request.data.get('title')
        message = request.data.get('message')
        notification_type = request.data.get('type', 'admin_message')
        if not title or not message:
            return Response({"error": "Title and message are required."}, status=status.HTTP_400_BAD_REQUEST)
        users = User.objects.filter(is_active=True)
        for user in users:
            Notification.objects.create(
                user=user,
                notification_type=notification_type,
                title=title,
                message=message
            )
        return Response({"message": f"Broadcast sent to {users.count()} users."}, status=status.HTTP_200_OK)
