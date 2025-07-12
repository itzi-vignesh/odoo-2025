from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Badge, UserBadge


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name', 
            'password', 'password_confirm', 'bio', 'location'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('Account is disabled.')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password.')
        
        return attrs


class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for badges"""
    
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon', 'criteria']


class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer for user badges"""
    
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ['badge', 'earned_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    
    user_badges = UserBadgeSerializer(many=True, read_only=True)
    full_name = serializers.ReadOnlyField()
    badges = serializers.SerializerMethodField()
    skills_offered = serializers.SerializerMethodField()
    skills_wanted = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'bio', 'location', 'avatar', 'role', 'availability', 'is_public',
            'rating', 'total_swaps', 'badges', 'skills_offered', 'skills_wanted',
            'user_badges', 'last_active', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'rating', 'total_swaps', 'created_at']
    
    def get_badges(self, obj):
        """Get user badge names"""
        return [ub.badge.name for ub in obj.user_badges.all()]
    
    def get_skills_offered(self, obj):
        """Get skills offered by user"""
        return [us.skill.name for us in obj.user_skills.filter(skill_type='offered')]
    
    def get_skills_wanted(self, obj):
        """Get skills wanted by user"""
        return [us.skill.name for us in obj.user_skills.filter(skill_type='wanted')]


class UserListSerializer(serializers.ModelSerializer):
    """Simplified serializer for user listings"""
    
    full_name = serializers.ReadOnlyField()
    badges = serializers.SerializerMethodField()
    skills_offered = serializers.SerializerMethodField()
    skills_wanted = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'avatar', 'location', 'rating', 'total_swaps',
            'availability', 'bio', 'badges', 'skills_offered', 'skills_wanted',
            'last_active'
        ]
    
    def get_badges(self, obj):
        """Get user badge names"""
        return [ub.badge.name for ub in obj.user_badges.all()]
    
    def get_skills_offered(self, obj):
        """Get skills offered by user"""
        return [us.skill.name for us in obj.user_skills.filter(skill_type='offered')]
    
    def get_skills_wanted(self, obj):
        """Get skills wanted by user"""
        return [us.skill.name for us in obj.user_skills.filter(skill_type='wanted')]


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'bio', 'location', 
            'avatar', 'availability', 'is_public'
        ]
