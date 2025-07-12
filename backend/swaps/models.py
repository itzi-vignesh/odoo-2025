from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class SwapRequest(models.Model):
    """Swap requests between users"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Request details
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
    
    # Skills involved
    offered_skill = models.CharField(max_length=100)  # What the requester offers
    wanted_skill = models.CharField(max_length=100)   # What the requester wants
    
    # Request content
    message = models.TextField(max_length=500)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    # Additional details
    proposed_duration = models.PositiveIntegerField(
        help_text="Proposed duration in hours", 
        blank=True, 
        null=True
    )
    preferred_format = models.CharField(
        max_length=50, 
        choices=[
            ('online', 'Online'),
            ('in_person', 'In Person'),
            ('flexible', 'Flexible'),
        ],
        default='flexible'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'swaps_swaprequest'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.from_user.full_name} → {self.to_user.full_name}: {self.offered_skill} ↔ {self.wanted_skill}"


class Rating(models.Model):
    """Ratings and feedback for completed swaps"""
    
    swap_request = models.OneToOneField(
        SwapRequest, 
        on_delete=models.CASCADE, 
        related_name='rating'
    )
    rater = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='given_ratings'
    )
    rated_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='received_ratings'
    )
    
    # Rating details
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    feedback = models.TextField(max_length=500, blank=True)
    
    # Specific rating aspects
    teaching_quality = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, 
        null=True
    )
    communication = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, 
        null=True
    )
    reliability = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, 
        null=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'swaps_rating'
        unique_together = ['swap_request', 'rater']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.rater.full_name} rated {self.rated_user.full_name}: {self.rating}/5"
