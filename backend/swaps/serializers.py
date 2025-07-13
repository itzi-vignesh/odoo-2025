import re
from django.utils.html import strip_tags
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import SwapRequest
from skills.models import Skill
from users.serializers import UserPublicSerializer

User = get_user_model()

class SwapRequestCreateSerializer(serializers.ModelSerializer):
    skill_offered_name = serializers.CharField(write_only=True, max_length=100)
    skill_wanted_name = serializers.CharField(write_only=True, max_length=100)
    to_user_id = serializers.IntegerField(write_only=True)
    message = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    
    class Meta:
        model = SwapRequest
        fields = ['skill_offered_name', 'skill_wanted_name', 'to_user_id', 'message']
    
    def validate_skill_offered_name(self, value):
        """Validate and sanitize skill offered name"""
        value = strip_tags(value).strip()
        if not value:
            raise serializers.ValidationError("Please specify a skill you want to offer.")
        if len(value) > 100:
            raise serializers.ValidationError("Skill name must be less than 100 characters.")
        # Remove special characters except spaces and hyphens
        value = re.sub(r'[^\w\s-]', '', value)
        if not value:
            raise serializers.ValidationError("Please enter a valid skill name.")
        return value.title()
    
    def validate_skill_wanted_name(self, value):
        """Validate and sanitize skill wanted name"""
        value = strip_tags(value).strip()
        if not value:
            raise serializers.ValidationError("Please specify a skill you want to learn.")
        if len(value) > 100:
            raise serializers.ValidationError("Skill name must be less than 100 characters.")
        # Remove special characters except spaces and hyphens
        value = re.sub(r'[^\w\s-]', '', value)
        if not value:
            raise serializers.ValidationError("Please enter a valid skill name.")
        return value.title()
    
    def validate_to_user_id(self, value):
        """Validate target user ID"""
        if not value or value <= 0:
            raise serializers.ValidationError("Please select a valid user.")
        return value
    
    def validate_message(self, value):
        """Validate and sanitize message"""
        if value:
            value = strip_tags(value).strip()
            if len(value) > 1000:
                raise serializers.ValidationError("Message must be less than 1000 characters.")
        return value
    
    def validate(self, attrs):
        # Validate that 'to_user' exists
        to_user_id = attrs.get('to_user_id')
        try:
            to_user = User.objects.get(id=to_user_id)
            attrs['to_user'] = to_user
        except User.DoesNotExist:
            raise serializers.ValidationError({"to_user_id": "User does not exist"})
        
        # Check if user is sending request to themselves
        if self.context['request'].user.id == to_user_id:
            raise serializers.ValidationError({"to_user_id": "Cannot send swap request to yourself"})
            
        # Validate skills exist or create them
        skill_offered_name = attrs.pop('skill_offered_name')
        skill_wanted_name = attrs.pop('skill_wanted_name')
        
        skill_offered, _ = Skill.objects.get_or_create(name=skill_offered_name)
        skill_wanted, _ = Skill.objects.get_or_create(name=skill_wanted_name)
        
        attrs['skill_offered'] = skill_offered
        attrs['skill_wanted'] = skill_wanted
        
        return attrs
    
    def create(self, validated_data):
        # Add from_user from the request
        validated_data['from_user'] = self.context['request'].user
        
        return SwapRequest.objects.create(**validated_data)

class SwapRequestDetailSerializer(serializers.ModelSerializer):
    from_user = UserPublicSerializer(read_only=True)
    to_user = UserPublicSerializer(read_only=True)
    skill_offered = serializers.SerializerMethodField()
    skill_wanted = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = SwapRequest
        fields = [
            'id', 'from_user', 'to_user', 'skill_offered', 'skill_wanted',
            'message', 'response_message', 'status', 'status_display', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'from_user', 'to_user', 'created_at', 'updated_at']
    
    def get_skill_offered(self, obj):
        return {
            'id': obj.skill_offered.id,
            'name': obj.skill_offered.name
        }
    
    def get_skill_wanted(self, obj):
        return {
            'id': obj.skill_wanted.id,
            'name': obj.skill_wanted.name
        }

class SwapRequestUpdateSerializer(serializers.ModelSerializer):
    response_message = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    
    class Meta:
        model = SwapRequest
        fields = ['status', 'response_message']
    
    def validate_response_message(self, value):
        """Validate and sanitize response message"""
        if value:
            value = strip_tags(value).strip()
            if len(value) > 1000:
                raise serializers.ValidationError("Response message must be less than 1000 characters.")
        return value
    
    def validate_status(self, status):
        # Only allowed status transitions based on current status
        current_status = self.instance.status
        
        # Define allowed transitions
        allowed_transitions = {
            SwapRequest.Status.PENDING: [
                SwapRequest.Status.ACCEPTED, 
                SwapRequest.Status.REJECTED,
                SwapRequest.Status.CANCELED
            ],
            SwapRequest.Status.ACCEPTED: [
                SwapRequest.Status.COMPLETED,
                SwapRequest.Status.CANCELED
            ],
        }
        
        if status not in allowed_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot change status from '{current_status}' to '{status}'"
            )
        
        return status
    
    def validate(self, attrs):
        # Check permissions based on user role
        user = self.context['request'].user
        swap_request = self.instance
        
        if 'status' in attrs:
            if attrs['status'] == SwapRequest.Status.CANCELED:
                # Both users can cancel
                if user != swap_request.from_user and user != swap_request.to_user:
                    raise serializers.ValidationError({"status": "Only involved users can cancel a swap"})
            
            elif attrs['status'] in [SwapRequest.Status.ACCEPTED, SwapRequest.Status.REJECTED]:
                # Only 'to_user' can accept or reject
                if user != swap_request.to_user:
                    raise serializers.ValidationError(
                        {"status": "Only the request recipient can accept or reject"}
                    )
            
            elif attrs['status'] == SwapRequest.Status.COMPLETED:
                # Both users can mark as completed
                if user != swap_request.from_user and user != swap_request.to_user:
                    raise serializers.ValidationError(
                        {"status": "Only involved users can mark a swap as completed"}
                    )
                # Only accepted swaps can be completed
                if swap_request.status != SwapRequest.Status.ACCEPTED:
                    raise serializers.ValidationError(
                        {"status": "Only accepted swaps can be marked as completed"}
                    )
        
        return attrs
