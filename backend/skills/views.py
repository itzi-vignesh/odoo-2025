from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Skill, UserSkill
from .serializers import SkillSerializer, UserSkillSerializer, UserSkillCreateSerializer


class SkillListView(generics.ListAPIView):
    """List all available skills"""
    
    queryset = Skill.objects.filter(is_active=True)
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset.order_by('name')


class UserSkillListView(generics.ListCreateAPIView):
    """List and create user skills"""
    
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        if user_id:
            return UserSkill.objects.filter(user_id=user_id)
        return UserSkill.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserSkillCreateSerializer
        return UserSkillSerializer


class UserSkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a user skill"""
    
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_skills(request):
    """Get current user's skills organized by type"""
    
    user_skills = UserSkill.objects.filter(user=request.user)
    
    offered_skills = user_skills.filter(skill_type='offered')
    wanted_skills = user_skills.filter(skill_type='wanted')
    
    return Response({
        'offered': UserSkillSerializer(offered_skills, many=True).data,
        'wanted': UserSkillSerializer(wanted_skills, many=True).data
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def skill_categories(request):
    """Get all skill categories"""
    
    from .models import Skill
    categories = [choice[0] for choice in Skill.CATEGORY_CHOICES]
    
    return Response({
        'categories': categories
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_skill_to_user(request):
    """Add a skill to user (offered or wanted)"""
    
    skill_name = request.data.get('skill_name')
    skill_type = request.data.get('skill_type')
    proficiency = request.data.get('proficiency', '')
    description = request.data.get('description', '')
    
    if not skill_name or not skill_type:
        return Response(
            {'error': 'skill_name and skill_type are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if skill_type not in ['offered', 'wanted']:
        return Response(
            {'error': 'skill_type must be either "offered" or "wanted"'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get or create skill
    skill, created = Skill.objects.get_or_create(
        name=skill_name,
        defaults={'category': 'other'}
    )
    
    # Check if user already has this skill with this type
    user_skill, created = UserSkill.objects.get_or_create(
        user=request.user,
        skill=skill,
        skill_type=skill_type,
        defaults={
            'proficiency': proficiency,
            'description': description
        }
    )
    
    if not created:
        return Response(
            {'error': f'You already have this skill as {skill_type}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({
        'message': 'Skill added successfully',
        'user_skill': UserSkillSerializer(user_skill).data
    }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_skill_from_user(request, skill_id):
    """Remove a skill from user"""
    
    try:
        user_skill = UserSkill.objects.get(
            id=skill_id, 
            user=request.user
        )
        user_skill.delete()
        
        return Response({
            'message': 'Skill removed successfully'
        })
    except UserSkill.DoesNotExist:
        return Response(
            {'error': 'User skill not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
