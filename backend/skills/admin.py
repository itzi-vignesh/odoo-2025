from django.contrib import admin
from .models import Skill, UserSkill


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    """Admin interface for Skill model"""
    
    list_display = ['name', 'category', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['category', 'name']


@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    """Admin interface for UserSkill model"""
    
    list_display = ['user', 'skill', 'skill_type', 'proficiency', 'created_at']
    list_filter = ['skill_type', 'proficiency', 'skill__category', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'skill__name']
    ordering = ['-created_at']
