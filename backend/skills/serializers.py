from rest_framework import serializers
from .models import Skill, UserSkill


class SkillSerializer(serializers.ModelSerializer):
    """Serializer for skills"""
    
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'description']


class UserSkillSerializer(serializers.ModelSerializer):
    """Serializer for user skills"""
    
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.IntegerField(write_only=True)
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    
    class Meta:
        model = UserSkill
        fields = [
            'id', 'skill', 'skill_id', 'skill_name', 'skill_type', 
            'proficiency', 'description', 'created_at'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class UserSkillCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating user skills"""
    
    skill_name = serializers.CharField(max_length=100)
    
    class Meta:
        model = UserSkill
        fields = ['skill_name', 'skill_type', 'proficiency', 'description']
    
    def create(self, validated_data):
        user = self.context['request'].user
        skill_name = validated_data.pop('skill_name')
        
        # Get or create skill
        skill, created = Skill.objects.get_or_create(
            name=skill_name,
            defaults={'category': 'other'}
        )
        
        # Create user skill
        user_skill = UserSkill.objects.create(
            user=user,
            skill=skill,
            **validated_data
        )
        
        return user_skill
