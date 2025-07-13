from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from skills.models import Skill

class SwapRequest(models.Model):
    """
    Swap Request model for skill exchanges between users
    """
    # Status choices
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        ACCEPTED = 'accepted', _('Accepted')
        REJECTED = 'rejected', _('Rejected')
        COMPLETED = 'completed', _('Completed')
        CANCELED = 'canceled', _('Canceled')
    
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='sent_requests'
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='received_requests'
    )
    skill_offered = models.ForeignKey(
        Skill, 
        on_delete=models.CASCADE,
        related_name='offered_in_swaps'
    )
    skill_wanted = models.ForeignKey(
        Skill, 
        on_delete=models.CASCADE,
        related_name='wanted_in_swaps'
    )
    message = models.TextField(help_text=_('Message from the requester'))
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING
    )
    response_message = models.TextField(blank=True, null=True, help_text=_('Response from the receiver'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.from_user.username} → {self.to_user.username}: {self.skill_offered.name} ↔ {self.skill_wanted.name}"
        
    class Meta:
        ordering = ['-created_at']
