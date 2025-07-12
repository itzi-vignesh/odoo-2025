from django.contrib import admin
from .models import SwapRequest, Rating


@admin.register(SwapRequest)
class SwapRequestAdmin(admin.ModelAdmin):
    """Admin interface for SwapRequest model"""
    
    list_display = ['from_user', 'to_user', 'offered_skill', 'wanted_skill', 'status', 'created_at']
    list_filter = ['status', 'preferred_format', 'created_at']
    search_fields = [
        'from_user__email', 'from_user__first_name', 'from_user__last_name',
        'to_user__email', 'to_user__first_name', 'to_user__last_name',
        'offered_skill', 'wanted_skill'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    """Admin interface for Rating model"""
    
    list_display = ['rater', 'rated_user', 'rating', 'teaching_quality', 'communication', 'reliability', 'created_at']
    list_filter = ['rating', 'teaching_quality', 'communication', 'reliability', 'created_at']
    search_fields = [
        'rater__email', 'rater__first_name', 'rater__last_name',
        'rated_user__email', 'rated_user__first_name', 'rated_user__last_name'
    ]
    ordering = ['-created_at']
    readonly_fields = ['created_at']
