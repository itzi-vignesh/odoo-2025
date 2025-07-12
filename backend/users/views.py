from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import User, Badge
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    UserListSerializer, UserUpdateSerializer, BadgeSerializer
)


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'User created successfully',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """User login endpoint"""
    
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        # Update last active
        user.save(update_fields=['last_active'])
        
        return Response({
            'message': 'Login successful',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class LogoutView(generics.GenericAPIView):
    """User logout endpoint"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                # Note: Token blacklisting requires django-rest-framework-simplejwt[crypto]
                # For now, we'll just return success
                pass
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveAPIView):
    """Get user profile"""
    
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ProfileUpdateView(generics.UpdateAPIView):
    """Update user profile"""
    
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserDiscoveryView(generics.ListAPIView):
    """Discover users for skill swaps"""
    
    serializer_class = UserListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = User.objects.filter(is_public=True, is_active=True)
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(bio__icontains=search) |
                Q(location__icontains=search)
            )
        
        # Filter by availability
        availability = self.request.query_params.get('availability', None)
        if availability:
            queryset = queryset.filter(availability=availability)
        
        return queryset.order_by('-last_active')


class UserDetailView(generics.RetrieveAPIView):
    """Get specific user details"""
    
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'
    
    def get_queryset(self):
        return User.objects.filter(is_public=True, is_active=True)


class UserBadgeListView(generics.ListAPIView):
    """List user's badges"""
    
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Badge.objects.filter(badge_users__user=user)


class AvailableBadgesView(generics.ListAPIView):
    """List all available badges"""
    
    queryset = Badge.objects.filter(is_active=True)
    serializer_class = BadgeSerializer
    permission_classes = [permissions.AllowAny]


# Admin views
class AdminUserListView(generics.ListAPIView):
    """Admin: List all users"""
    
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only allow admin users
        if not self.request.user.is_admin:
            return User.objects.none()
        return super().get_queryset()


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """Admin: Get/update specific user details"""
    
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = 'user_id'
    
    def get_queryset(self):
        if not self.request.user.is_admin:
            return User.objects.none()
        return super().get_queryset()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_user_status(request, user_id):
    """Admin: Toggle user active status"""
    
    if not request.user.is_admin:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(id=user_id)
        user.is_active = not user.is_active
        user.save()
        
        return Response({
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
            'user': UserProfileSerializer(user).data
        })
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """Get user statistics"""
    
    user = request.user
    
    # Calculate stats
    offered_skills_count = user.user_skills.filter(skill_type='offered').count()
    wanted_skills_count = user.user_skills.filter(skill_type='wanted').count()
    badges_count = user.user_badges.count()
    
    stats = {
        'total_swaps': user.total_swaps,
        'rating': user.rating,
        'offered_skills': offered_skills_count,
        'wanted_skills': wanted_skills_count,
        'badges_earned': badges_count,
        'member_since': user.date_joined,
        'last_active': user.last_active,
    }
    
    return Response(stats)
