from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Skill, UserSkill
from .serializers import SkillSerializer, UserSkillCreateSerializer, UserSkillDetailSerializer
from users.permissions import IsOwnerOrAdmin, IsAdminUser

class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows skills to be viewed.
    """
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular skills based on usage"""
        popular_skills = Skill.objects.all().order_by('-userskill')[:20]
        serializer = self.get_serializer(popular_skills, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        """Admin: Reject (delete) a skill. In future, add moderation status instead of delete."""
        try:
            skill = self.get_object()
            skill_name = skill.name
            skill.delete()
            return Response({"message": f"Skill '{skill_name}' rejected and deleted."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserSkillViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing user skills (offered and wanted)
    """
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        # Filter skills by the requested user
        user_id = self.kwargs.get('user_pk')
        if user_id:
            return UserSkill.objects.filter(user_id=user_id)
        # For non-detailed routes, only return the current user's skills
        return UserSkill.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update' or self.action == 'partial_update':
            return UserSkillCreateSerializer
        return UserSkillDetailSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def offered(self, request):
        """Get current user's offered skills"""
        skills = self.get_queryset().filter(skill_type=UserSkill.SkillType.OFFERED)
        serializer = UserSkillDetailSerializer(skills, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def wanted(self, request):
        """Get current user's wanted skills"""
        skills = self.get_queryset().filter(skill_type=UserSkill.SkillType.WANTED)
        serializer = UserSkillDetailSerializer(skills, many=True)
        return Response(serializer.data)
