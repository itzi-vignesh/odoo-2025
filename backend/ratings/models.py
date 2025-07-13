from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from swaps.models import SwapRequest

class Rating(models.Model):
    """
    Rating model for users to rate each other after a swap
    """
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='ratings_given'
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='ratings_received'
    )
    swap_request = models.ForeignKey(
        SwapRequest,
        on_delete=models.CASCADE,
        related_name='ratings'
    )
    score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text=_('Rating from 1 to 5 stars')
    )
    feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('from_user', 'swap_request')
        
    def __str__(self):
        return f"{self.from_user.username} → {self.to_user.username}: {self.score}★"
        
    def save(self, *args, **kwargs):
        """Override save to update user's average rating"""
        super().save(*args, **kwargs)
        # Update the recipient's rating
        to_user = self.to_user
        ratings = Rating.objects.filter(to_user=to_user)
        
        if ratings:
            to_user.rating = sum(r.score for r in ratings) / len(ratings)
            to_user.total_ratings = len(ratings)
            to_user.save(update_fields=['rating', 'total_ratings'])
