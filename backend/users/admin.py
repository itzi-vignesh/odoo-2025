from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Badge, UserBadge


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model"""
    
    list_display = ['email', 'full_name', 'role', 'is_active', 'total_swaps', 'rating', 'created_at']
    list_filter = ['role', 'is_active', 'availability', 'is_public', 'created_at']
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {
            'fields': ('first_name', 'last_name', 'bio', 'location', 'avatar')
        }),
        ('Role & Status', {
            'fields': ('role', 'availability', 'is_public', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Stats', {
            'fields': ('rating', 'total_swaps'),
            'classes': ('collapse',)
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined', 'last_active'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    """Admin interface for Badge model"""
    
    list_display = ['name', 'icon', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    """Admin interface for UserBadge model"""
    
    list_display = ['user', 'badge', 'earned_at']
    list_filter = ['badge', 'earned_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'badge__name']
    ordering = ['-earned_at']
