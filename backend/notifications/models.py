from django.db import models
from django.conf import settings


class Notification(models.Model):
    """Notifications for users"""
    
    TYPE_CHOICES = [
        ('swap_request', 'Swap Request'),
        ('swap_accepted', 'Swap Accepted'),
        ('swap_rejected', 'Swap Rejected'),
        ('swap_completed', 'Swap Completed'),
        ('rating_received', 'Rating Received'),
        ('badge_earned', 'Badge Earned'),
        ('system', 'System'),
    ]
    
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sent_notifications',
        blank=True,
        null=True
    )
    
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField(max_length=500)
    
    # Optional reference to related objects
    related_object_id = models.PositiveIntegerField(blank=True, null=True)
    related_object_type = models.CharField(max_length=50, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    is_important = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'notifications_notification'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read']),
        ]
    
    def __str__(self):
        return f"{self.title} → {self.recipient.full_name}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = models.timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
