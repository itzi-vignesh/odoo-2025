from django.db import models
from django.conf import settings


class Skill(models.Model):
    """Skills that can be offered or wanted by users"""
    
    CATEGORY_CHOICES = [
        ('technology', 'Technology'),
        ('design', 'Design'),
        ('language', 'Language'),
        ('music', 'Music'),
        ('sports', 'Sports'),
        ('cooking', 'Cooking'),
        ('business', 'Business'),
        ('arts', 'Arts'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField(max_length=300, blank=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'skills_skill'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class UserSkill(models.Model):
    """Skills associated with users (offered or wanted)"""
    
    SKILL_TYPE_CHOICES = [
        ('offered', 'Offered'),
        ('wanted', 'Wanted'),
    ]
    
    PROFICIENCY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='skill_users')
    skill_type = models.CharField(max_length=10, choices=SKILL_TYPE_CHOICES)
    proficiency = models.CharField(max_length=15, choices=PROFICIENCY_CHOICES, blank=True)
    description = models.TextField(max_length=300, blank=True, help_text="Personal notes about this skill")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'skills_userskill'
        unique_together = ['user', 'skill', 'skill_type']
        ordering = ['skill__name']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.skill.name} ({self.skill_type})"
