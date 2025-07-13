from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Rating
from .serializers import RatingSerializer, RatingCreateSerializer
from users.permissions import IsOwnerOrAdmin
from notifications.models import Notification
from users.models import User, Badge, UserBadge

# Create your views here.

class RatingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing ratings
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'score']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter by user ID if provided
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return Rating.objects.filter(to_user_id=user_id)
        
        # By default, show ratings for current user
        return Rating.objects.filter(to_user=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RatingCreateSerializer
        return RatingSerializer
    
    def perform_create(self, serializer):
        rating = serializer.save()
        
        # Create notification for user who received the rating
        Notification.objects.create(
            user=rating.to_user,
            notification_type=Notification.Type.NEW_RATING,
            title="New Rating Received",
            message=f"{rating.from_user.username} gave you a {rating.score}-star rating",
            related_object_id=rating.id,
            related_object_type="rating"
        )
        
        # Check for badges based on ratings
        self.check_rating_badges(rating.to_user)
    
    def check_rating_badges(self, user):
        """Award badges based on ratings and swap completion"""
        # Get total ratings and average score
        total_ratings = user.total_ratings
        avg_rating = user.rating
        total_swaps = user.total_completed_swaps
        
        # Award badge for first 5-star rating
        if avg_rating >= 5.0 and total_ratings >= 1:
            badge, created = Badge.objects.get_or_create(
                name="Perfect Rating",
                defaults={
                    "description": "Received a perfect 5-star rating",
                    "icon": "⭐"
                }
            )
            UserBadge.objects.get_or_create(user=user, badge=badge)
            
        # Award badge for completing 5 swaps
        if total_swaps >= 5:
            badge, created = Badge.objects.get_or_create(
                name="Frequent Swapper",
                defaults={
                    "description": "Completed 5 or more skill swaps",
                    "icon": "🔄"
                }
            )
            user_badge, created = UserBadge.objects.get_or_create(user=user, badge=badge)
            if created:
                Notification.objects.create(
                    user=user,
                    notification_type=Notification.Type.BADGE_EARNED,
                    title="New Badge Earned",
                    message=f"You've earned the '{badge.name}' badge!",
                    related_object_id=badge.id,
                    related_object_type="badge"
                )
        
        # Award badge for high rating with multiple reviews
        if avg_rating >= 4.5 and total_ratings >= 5:
            badge, created = Badge.objects.get_or_create(
                name="Top Rated",
                defaults={
                    "description": "Maintained a 4.5+ rating across 5+ reviews",
                    "icon": "🏆"
                }
            )
            user_badge, created = UserBadge.objects.get_or_create(user=user, badge=badge)
            if created:
                Notification.objects.create(
                    user=user,
                    notification_type=Notification.Type.BADGE_EARNED,
                    title="New Badge Earned",
                    message=f"You've earned the '{badge.name}' badge!",
                    related_object_id=badge.id,
                    related_object_type="badge"
                )
