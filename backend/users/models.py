from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Custom User model for Talent Bridge platform
    """
    # Role choices
    class Roles(models.TextChoices):
        USER = 'user', _('User')
        ADMIN = 'admin', _('Admin')
        GUEST = 'guest', _('Guest')
    
    # Fields
    role = models.CharField(
        max_length=10,
        choices=Roles.choices,
        default=Roles.USER,
        help_text=_('User role in the system')
    )
    bio = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_public = models.BooleanField(default=True, help_text=_('Whether the profile is visible to others'))
    
    # Availability choices
    class Availability(models.TextChoices):
        WEEKDAYS = 'weekdays', _('Weekdays')
        WEEKENDS = 'weekends', _('Weekends')
        EVENINGS = 'evenings', _('Evenings')
        MORNINGS = 'mornings', _('Mornings')
        FLEXIBLE = 'flexible', _('Flexible Schedule')
        BUSY = 'busy', _('Currently Busy')
    
    availability = models.CharField(
        max_length=15, 
        choices=Availability.choices,
        default=Availability.FLEXIBLE
    )
    
    # Rating (avg of received ratings)
    rating = models.FloatField(default=0.0)
    total_ratings = models.PositiveIntegerField(default=0)
    total_completed_swaps = models.PositiveIntegerField(default=0)
    
    # Additional fields
    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def is_admin(self):
        return self.role == self.Roles.ADMIN

class Badge(models.Model):
    """
    Badge model for user achievements
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text=_('Emoji or icon identifier'))
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class UserBadge(models.Model):
    """
    Association between User and Badge
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'badge')
        
    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"
