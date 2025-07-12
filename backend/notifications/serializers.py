from rest_framework import serializers
from .models import Notification
from users.serializers import UserListSerializer


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    
    sender = UserListSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'sender', 'notification_type', 'title', 'message',
            'related_object_id', 'related_object_type', 'is_read', 
            'is_important', 'created_at', 'read_at'
        ]
        read_only_fields = ['id', 'sender', 'created_at', 'read_at']


class NotificationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating notification status"""
    
    class Meta:
        model = Notification
        fields = ['is_read']
