from rest_framework import serializers
from .models import SwapRequest, Rating
from users.serializers import UserListSerializer


class SwapRequestSerializer(serializers.ModelSerializer):
    """Serializer for swap requests"""
    
    from_user = UserListSerializer(read_only=True)
    to_user = UserListSerializer(read_only=True)
    to_user_id = serializers.IntegerField(write_only=True)
    rated = serializers.SerializerMethodField()
    
    class Meta:
        model = SwapRequest
        fields = [
            'id', 'from_user', 'to_user', 'to_user_id', 'offered_skill', 
            'wanted_skill', 'message', 'status', 'proposed_duration', 
            'preferred_format', 'created_at', 'updated_at', 'completed_at', 'rated'
        ]
        read_only_fields = ['id', 'from_user', 'status', 'created_at', 'updated_at', 'completed_at']
    
    def get_rated(self, obj):
        """Check if the swap has been rated"""
        return hasattr(obj, 'rating')
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['from_user'] = user
        return super().create(validated_data)


class SwapRequestUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating swap request status"""
    
    class Meta:
        model = SwapRequest
        fields = ['status']
    
    def validate_status(self, value):
        """Validate status transitions"""
        instance = self.instance
        current_status = instance.status if instance else None
        
        valid_transitions = {
            'pending': ['accepted', 'rejected', 'cancelled'],
            'accepted': ['completed', 'cancelled'],
            'rejected': [],
            'completed': [],
            'cancelled': []
        }
        
        if current_status and value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot change status from {current_status} to {value}"
            )
        
        return value


class RatingSerializer(serializers.ModelSerializer):
    """Serializer for ratings"""
    
    rater = UserListSerializer(read_only=True)
    rated_user = UserListSerializer(read_only=True)
    swap_request_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Rating
        fields = [
            'id', 'swap_request_id', 'rater', 'rated_user', 'rating', 'feedback',
            'teaching_quality', 'communication', 'reliability', 'created_at'
        ]
        read_only_fields = ['id', 'rater', 'rated_user', 'created_at']
    
    def create(self, validated_data):
        user = self.context['request'].user
        swap_request_id = validated_data.pop('swap_request_id')
        
        try:
            swap_request = SwapRequest.objects.get(id=swap_request_id, status='completed')
        except SwapRequest.DoesNotExist:
            raise serializers.ValidationError("Invalid or incomplete swap request")
        
        # Determine who is being rated
        if swap_request.from_user == user:
            rated_user = swap_request.to_user
        elif swap_request.to_user == user:
            rated_user = swap_request.from_user
        else:
            raise serializers.ValidationError("You can only rate swaps you participated in")
        
        # Check if already rated
        if Rating.objects.filter(swap_request=swap_request, rater=user).exists():
            raise serializers.ValidationError("You have already rated this swap")
        
        rating = Rating.objects.create(
            swap_request=swap_request,
            rater=user,
            rated_user=rated_user,
            **validated_data
        )
        
        return rating


class RatingCreateSerializer(serializers.Serializer):
    """Simple serializer for rating creation from frontend"""
    
    rating = serializers.IntegerField(min_value=1, max_value=5)
    feedback = serializers.CharField(max_length=500, required=False, allow_blank=True)
