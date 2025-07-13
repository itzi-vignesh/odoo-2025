from rest_framework import serializers
from .models import Skill, UserSkill

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

class UserSkillCreateSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(write_only=True)
    
    class Meta:
        model = UserSkill
        fields = ['skill_name', 'skill_type', 'proficiency', 'description']
    
    def create(self, validated_data):
        skill_name = validated_data.pop('skill_name')
        user = self.context['request'].user
        
        # Get or create the skill
        skill, _ = Skill.objects.get_or_create(name=skill_name)
        
        # Check if user already has this skill with this type
        existing = UserSkill.objects.filter(
            user=user,
            skill=skill,
            skill_type=validated_data['skill_type']
        ).first()
        
        if existing:
            # Update instead of create
            for attr, value in validated_data.items():
                setattr(existing, attr, value)
            existing.save()
            return existing
            
        # Create new user skill
        return UserSkill.objects.create(
            user=user,
            skill=skill,
            **validated_data
        )

class UserSkillDetailSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name')
    proficiency_display = serializers.CharField(source='get_proficiency_display')
    
    class Meta:
        model = UserSkill
        fields = [
            'id', 'skill_name', 'skill_type', 'proficiency', 
            'proficiency_display', 'description', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
