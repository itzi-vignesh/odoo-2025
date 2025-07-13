import re
from django.utils.html import strip_tags
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'notification_type_display',
            'title', 'message', 'related_object_id', 
            'related_object_type', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'notification_type', 'notification_type_display',
                         'title', 'message', 'related_object_id',
                         'related_object_type', 'created_at']

class NotificationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['is_read']
    
    def validate_is_read(self, value):
        """Validate is_read field"""
        if not isinstance(value, bool):
            raise serializers.ValidationError("is_read must be a boolean value")
        return value
