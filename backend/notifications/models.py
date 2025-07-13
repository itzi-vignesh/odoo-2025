from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Notification(models.Model):
    """
    Notification model for system notifications to users
    """
    # Type choices
    class Type(models.TextChoices):
        SWAP_REQUEST = 'swap_request', _('Swap Request')
        SWAP_ACCEPTED = 'swap_accepted', _('Swap Accepted')
        SWAP_REJECTED = 'swap_rejected', _('Swap Rejected')
        SWAP_COMPLETED = 'swap_completed', _('Swap Completed')
        NEW_RATING = 'new_rating', _('New Rating')
        BADGE_EARNED = 'badge_earned', _('Badge Earned')
        ADMIN_MESSAGE = 'admin_message', _('Admin Message')
        SYSTEM = 'system', _('System Message')
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=20,
        choices=Type.choices
    )
    title = models.CharField(max_length=100)
    message = models.TextField()
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object_type = models.CharField(max_length=50, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.get_notification_type_display()} for {self.user.username}: {self.title}"
