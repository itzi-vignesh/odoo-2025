import re
from django.core.validators import RegexValidator
from django.utils.html import strip_tags
from django.utils.text import slugify
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Badge, UserBadge
from skills.models import UserSkill, Skill

User = get_user_model()

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon']

class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer()
    
    class Meta:
        model = UserBadge
        fields = ['badge', 'awarded_at']

class UserSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    
    class Meta:
        model = UserSkill
        fields = ['id', 'skill', 'skill_name', 'skill_type', 'proficiency', 'description']
        read_only_fields = ['id']

class UserSerializer(serializers.ModelSerializer):
    badges = serializers.SerializerMethodField()
    skills_offered = serializers.SerializerMethodField()
    skills_wanted = serializers.SerializerMethodField()
    is_admin = serializers.BooleanField(read_only=True)
    role = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'bio', 'location',
            'avatar', 'is_public', 'availability', 'rating', 'total_ratings', 
            'total_completed_swaps', 'is_admin', 'role', 'badges', 'skills_offered', 
            'skills_wanted', 'joined_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'rating', 'total_ratings', 
                          'total_completed_swaps', 'is_admin', 'role', 'joined_at', 'updated_at']
    
    def get_badges(self, obj):
        user_badges = UserBadge.objects.filter(user=obj)
        return UserBadgeSerializer(user_badges, many=True).data
    
    def get_skills_offered(self, obj):
        skills = UserSkill.objects.filter(user=obj, skill_type=UserSkill.SkillType.OFFERED)
        return UserSkillSerializer(skills, many=True).data
    
    def get_skills_wanted(self, obj):
        skills = UserSkill.objects.filter(user=obj, skill_type=UserSkill.SkillType.WANTED)
        return UserSkillSerializer(skills, many=True).data

class UserPublicSerializer(serializers.ModelSerializer):
    badges = serializers.SerializerMethodField()
    skills_offered = serializers.SerializerMethodField()
    skills_wanted = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'name', 'username', 'bio', 'location', 'avatar', 'availability',
            'rating', 'total_ratings', 'total_completed_swaps', 'badges',
            'skills_offered', 'skills_wanted', 'joined_at'
        ]
    
    def get_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.username
    
    def get_badges(self, obj):
        user_badges = UserBadge.objects.filter(user=obj)
        return UserBadgeSerializer(user_badges, many=True).data
    
    def get_skills_offered(self, obj):
        skills = UserSkill.objects.filter(user=obj, skill_type=UserSkill.SkillType.OFFERED)
        return UserSkillSerializer(skills, many=True).data
    
    def get_skills_wanted(self, obj):
        skills = UserSkill.objects.filter(user=obj, skill_type=UserSkill.SkillType.WANTED)
        return UserSkillSerializer(skills, many=True).data

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    skills_offered = serializers.ListField(
        child=serializers.CharField(max_length=100), 
        write_only=True, 
        required=False,
        allow_empty=False
    )
    skills_wanted = serializers.ListField(
        child=serializers.CharField(max_length=100), 
        write_only=True, 
        required=False,
        allow_empty=False
    )
    avatar = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    # Add validators for input sanitization
    username = serializers.CharField(
        max_length=150,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9_]+$',
                message='Username can only contain letters, numbers, and underscores.'
            )
        ]
    )
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    bio = serializers.CharField(max_length=500, required=False, allow_blank=True)
    location = serializers.CharField(max_length=100)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2', 'first_name', 'last_name',
            'bio', 'location', 'avatar', 'availability', 'is_public', 'skills_offered', 'skills_wanted'
        ]
    
    def validate_email(self, value):
        """Validate and sanitize email"""
        value = value.lower().strip()
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise serializers.ValidationError("Please enter a valid email address.")
        return value
    
    def validate_username(self, value):
        """Validate and sanitize username"""
        value = value.lower().strip()
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        if len(value) > 30:
            raise serializers.ValidationError("Username must be less than 30 characters.")
        return value
    
    def validate_first_name(self, value):
        """Validate and sanitize first name"""
        value = strip_tags(value).strip()
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("First name can only contain letters and spaces.")
        if len(value) < 2:
            raise serializers.ValidationError("First name must be at least 2 characters long.")
        return value.title()
    
    def validate_last_name(self, value):
        """Validate and sanitize last name"""
        value = strip_tags(value).strip()
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("Last name can only contain letters and spaces.")
        if len(value) < 2:
            raise serializers.ValidationError("Last name must be at least 2 characters long.")
        return value.title()
    
    def validate_bio(self, value):
        """Validate and sanitize bio"""
        if value:
            value = strip_tags(value).strip()
            if len(value) > 500:
                raise serializers.ValidationError("Bio must be less than 500 characters.")
        return value
    
    def validate_location(self, value):
        """Validate and sanitize location"""
        value = strip_tags(value).strip()
        if not value:
            raise serializers.ValidationError("Location is required.")
        if len(value) < 2:
            raise serializers.ValidationError("Location must be at least 2 characters long.")
        if len(value) > 100:
            raise serializers.ValidationError("Location must be less than 100 characters.")
        return value
    
    def validate_skills_offered(self, value):
        """Validate and sanitize skills offered"""
        if not value:
            raise serializers.ValidationError("Please add at least one skill you can offer.")
        
        sanitized_skills = []
        for skill in value:
            skill = strip_tags(skill).strip()
            if skill and len(skill) <= 100:
                # Remove special characters except spaces and hyphens
                skill = re.sub(r'[^\w\s-]', '', skill)
                if skill:
                    sanitized_skills.append(skill.title())
        
        if not sanitized_skills:
            raise serializers.ValidationError("Please add at least one valid skill you can offer.")
        
        return sanitized_skills
    
    def validate_skills_wanted(self, value):
        """Validate and sanitize skills wanted"""
        if not value:
            return []
        
        sanitized_skills = []
        for skill in value:
            skill = strip_tags(skill).strip()
            if skill and len(skill) <= 100:
                # Remove special characters except spaces and hyphens
                skill = re.sub(r'[^\w\s-]', '', skill)
                if skill:
                    sanitized_skills.append(skill.title())
        
        return sanitized_skills
    
    def validate(self, attrs):
        """Cross-field validation"""
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
            
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "User with this email already exists."})
        
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})
        
        # Handle empty avatar field
        if 'avatar' in attrs and (attrs['avatar'] == '' or attrs['avatar'] is None):
            attrs['avatar'] = None
            
        return attrs
        
    def create(self, validated_data):
        """Create user with skills"""
        skills_offered = validated_data.pop('skills_offered', [])
        skills_wanted = validated_data.pop('skills_wanted', [])
        
        user = User.objects.create_user(**validated_data)
        
        # Create skills for user
        for skill_name in skills_offered:
            if skill_name.strip():
                skill, _ = Skill.objects.get_or_create(name=skill_name.strip())
                UserSkill.objects.create(
                    user=user,
                    skill=skill,
                    skill_type=UserSkill.SkillType.OFFERED
                )
                
        for skill_name in skills_wanted:
            if skill_name.strip():
                skill, _ = Skill.objects.get_or_create(name=skill_name.strip())
                UserSkill.objects.create(
                    user=user,
                    skill=skill,
                    skill_type=UserSkill.SkillType.WANTED
                )
        
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        email = attrs.get('email')
        
        if not username and not email:
            raise serializers.ValidationError("Either username or email is required")
            
        return attrs

class UserUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    bio = serializers.CharField(max_length=500, required=False, allow_blank=True)
    location = serializers.CharField(max_length=100)
    avatar = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'bio', 'location',
            'avatar', 'is_public', 'availability'
        ]
    
    def validate_first_name(self, value):
        """Validate and sanitize first name"""
        value = strip_tags(value).strip()
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("First name can only contain letters and spaces.")
        if len(value) < 2:
            raise serializers.ValidationError("First name must be at least 2 characters long.")
        return value.title()
    
    def validate_last_name(self, value):
        """Validate and sanitize last name"""
        value = strip_tags(value).strip()
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("Last name can only contain letters and spaces.")
        if len(value) < 2:
            raise serializers.ValidationError("Last name must be at least 2 characters long.")
        return value.title()
    
    def validate_bio(self, value):
        """Validate and sanitize bio"""
        if value:
            value = strip_tags(value).strip()
            if len(value) > 500:
                raise serializers.ValidationError("Bio must be less than 500 characters.")
        return value
    
    def validate_location(self, value):
        """Validate and sanitize location"""
        value = strip_tags(value).strip()
        if not value:
            raise serializers.ValidationError("Location is required.")
        if len(value) < 2:
            raise serializers.ValidationError("Location must be at least 2 characters long.")
        if len(value) > 100:
            raise serializers.ValidationError("Location must be less than 100 characters.")
        return value
    
    def validate_avatar(self, value):
        """Validate avatar URL"""
        if value:
            value = value.strip()
            # Basic URL validation
            if not re.match(r'^https?://.*', value) and not value.startswith('/'):
                raise serializers.ValidationError("Please enter a valid image URL.")
        return value

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_public', 'availability', 'is_active', 'role'
        ]
        read_only_fields = ['id', 'email', 'username']
