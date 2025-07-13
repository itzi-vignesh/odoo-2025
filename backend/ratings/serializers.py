import re
from django.utils.html import strip_tags
from rest_framework import serializers
from .models import Rating
from swaps.models import SwapRequest
from users.serializers import UserPublicSerializer

class RatingSerializer(serializers.ModelSerializer):
    from_user = UserPublicSerializer(read_only=True)
    to_user = UserPublicSerializer(read_only=True)
    
    class Meta:
        model = Rating
        fields = [
            'id', 'from_user', 'to_user', 'swap_request', 
            'score', 'feedback', 'created_at'
        ]
        read_only_fields = ['id', 'from_user', 'to_user', 'created_at']

class RatingCreateSerializer(serializers.ModelSerializer):
    swap_request_id = serializers.IntegerField()
    feedback = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    class Meta:
        model = Rating
        fields = ['swap_request_id', 'score', 'feedback']
    
    def validate_swap_request_id(self, value):
        """Validate swap request ID"""
        if not value or value <= 0:
            raise serializers.ValidationError("Please select a valid swap request.")
        
        user = self.context['request'].user
        
        try:
            swap_request = SwapRequest.objects.get(id=value)
        except SwapRequest.DoesNotExist:
            raise serializers.ValidationError("Swap request does not exist")
            
        # Check if user is part of the swap
        if user != swap_request.from_user and user != swap_request.to_user:
            raise serializers.ValidationError("You can only rate swaps you are involved in")
            
        # Check if swap is completed
        if swap_request.status != SwapRequest.Status.COMPLETED:
            raise serializers.ValidationError("Only completed swaps can be rated")
            
        # Check if user has already rated this swap
        if Rating.objects.filter(from_user=user, swap_request=swap_request).exists():
            raise serializers.ValidationError("You have already rated this swap")
            
        return value
    
    def validate_score(self, value):
        """Validate rating score"""
        if not isinstance(value, (int, float)):
            raise serializers.ValidationError("Score must be a number")
        if value < 1 or value > 5:
            raise serializers.ValidationError("Score must be between 1 and 5")
        return int(value)
    
    def validate_feedback(self, value):
        """Validate and sanitize feedback"""
        if value:
            value = strip_tags(value).strip()
            if len(value) > 500:
                raise serializers.ValidationError("Feedback must be less than 500 characters.")
            # Remove potentially harmful content
            value = re.sub(r'<script.*?</script>', '', value, flags=re.IGNORECASE)
            value = re.sub(r'javascript:', '', value, flags=re.IGNORECASE)
        return value
    
    def create(self, validated_data):
        user = self.context['request'].user
        swap_request_id = validated_data.pop('swap_request_id')
        swap_request = SwapRequest.objects.get(id=swap_request_id)
        
        # Determine who is being rated
        if user == swap_request.from_user:
            to_user = swap_request.to_user
        else:
            to_user = swap_request.from_user
            
        return Rating.objects.create(
            from_user=user,
            to_user=to_user,
            swap_request_id=swap_request_id,
            **validated_data
        )
