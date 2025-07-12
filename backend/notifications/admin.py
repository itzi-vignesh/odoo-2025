from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin interface for Notification model"""
    
    list_display = ['recipient', 'sender', 'notification_type', 'title', 'is_read', 'is_important', 'created_at']
    list_filter = ['notification_type', 'is_read', 'is_important', 'created_at']
    search_fields = [
        'recipient__email', 'recipient__first_name', 'recipient__last_name',
        'sender__email', 'sender__first_name', 'sender__last_name',
        'title', 'message'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'read_at']
    
    def mark_as_read(self, request, queryset):
        """Mark selected notifications as read"""
        queryset.update(is_read=True)
        self.message_user(request, f"{queryset.count()} notifications marked as read.")
    
    mark_as_read.short_description = "Mark selected notifications as read"
    
    actions = [mark_as_read]
