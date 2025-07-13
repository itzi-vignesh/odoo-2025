from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Skill(models.Model):
    """
    Skill model for the platform
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class UserSkill(models.Model):
    """
    Association between User and Skill
    """
    # Type choices
    class SkillType(models.TextChoices):
        OFFERED = 'offered', _('Offered')
        WANTED = 'wanted', _('Wanted')
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    skill_type = models.CharField(
        max_length=10,
        choices=SkillType.choices
    )
    proficiency = models.PositiveSmallIntegerField(
        choices=[
            (1, _('Beginner')),
            (2, _('Intermediate')),
            (3, _('Advanced')),
            (4, _('Expert')),
            (5, _('Master')),
        ],
        default=1
    )
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'skill', 'skill_type')
        
    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.get_skill_type_display()})"
