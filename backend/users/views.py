from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
import logging
from .serializers import (
    UserSerializer, UserPublicSerializer, RegisterSerializer,
    UserLoginSerializer, UserUpdateSerializer, AdminUserSerializer
)
from .models import Badge, UserBadge
from skills.models import Skill, UserSkill
from .permissions import IsAdminUser, IsOwnerOrAdmin
from swaps.serializers import SwapRequestDetailSerializer

User = get_user_model()
logger = logging.getLogger(__name__)

class RegisterView(generics.CreateAPIView):
    """
    Register a new user with profile details and skills
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Create user with skills (handled in serializer)
            user = serializer.save()
            
            # Create First Swap badge for new user
            first_badge, _ = Badge.objects.get_or_create(
                name="New Member",
                defaults={
                    "description": "Welcome to the skill swap community!",
                    "icon": "🆕"
                }
            )
            UserBadge.objects.create(user=user, badge=first_badge)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"New user registered: {user.username} ({user.email}) with {user.skills.count()} skills")
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
            
        except IntegrityError as e:
            logger.error(f"Registration failed - IntegrityError: {e}")
            if 'username' in str(e):
                return Response(
                    {"error": "This username is already taken. Please choose another."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif 'email' in str(e):
                return Response(
                    {"error": "This email is already registered. Please use a different email or try logging in."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                return Response(
                    {"error": "Registration failed. Please try again."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValidationError as e:
            logger.error(f"Registration failed - ValidationError: {e}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Registration failed - Unexpected error: {e}")
            return Response(
                {"error": "Registration failed. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token view that returns user details with token
    """
    def post(self, request, *args, **kwargs):
        try:
            # Handle both username and email login
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            
            if not password:
                return Response(
                    {"error": "Password is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            if not (username or email):
                return Response(
                    {"error": "Username or email is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # If email is provided, try to find the user and use their username
            if email and not username:
                try:
                    # Handle multiple users with same email by getting the first active one
                    user = User.objects.filter(email=email, is_active=True).first()
                    if not user:
                        return Response(
                            {"error": "Invalid email or password"}, 
                            status=status.HTTP_401_UNAUTHORIZED
                        )
                    request.data['username'] = user.username
                except Exception as e:
                    logger.error(f"Login failed - User lookup error: {e}")
                    return Response(
                        {"error": "Invalid email or password"}, 
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            
            # Use the parent class to handle JWT token generation
            response = super().post(request, *args, **kwargs)
            
            if response.status_code == 200:
                # Get the user to return user data
                try:
                    user = User.objects.get(username=request.data.get('username'))
                    response.data['user'] = UserSerializer(user).data
                    logger.info(f"User logged in: {user.username}")
                except User.DoesNotExist:
                    logger.error(f"Login failed - User not found: {request.data.get('username')}")
                    return Response(
                        {"error": "Invalid username or password"}, 
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                    
            return response
            
        except Exception as e:
            logger.error(f"Login failed - Unexpected error: {e}")
            return Response(
                {"error": "Login failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserViewSet(viewsets.ModelViewSet):
    """
    User management and profile endpoints
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'retrieve':
            return UserPublicSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return UserUpdateSerializer
        elif self.action == 'admin_list' or self.action == 'admin_update':
            return AdminUserSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action == 'list':
            # Allow anonymous users to view public profiles
            self.permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsOwnerOrAdmin]
        elif self.action in ['admin_list', 'admin_update']:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()
    
    def get_queryset(self):
        if self.action == 'list':
            # For public listing, only return public profiles, ordered by id to fix pagination
            return User.objects.filter(is_public=True, is_active=True).exclude(role='admin').order_by('id')
        return User.objects.all().order_by('id')
    
    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """Get current user's profile"""
        try:
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to get user profile: {e}")
            return Response(
                {"error": "Failed to load profile. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny], url_path='public-discover')
    def public_discover(self, request):
        """Public endpoint to discover basic platform information without authentication"""
        try:
            users = User.objects.filter(is_public=True, is_active=True)
            user_count = users.count()
            
            return Response({
                'user_count': user_count,
                'status': 'success',
                'message': 'Welcome to Talent Bridge! Browse members and skills without logging in.'
            })
        except Exception as e:
            logger.error(f"Failed to get public discover data: {e}")
            return Response(
                {"error": "Failed to load platform information."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current user's full profile with private data"""
        try:
            if not request.user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to get user profile: {e}")
            return Response(
                {"error": "Failed to load profile. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current user's profile"""
        try:
            if not request.user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
            serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                logger.info(f"User profile updated: {request.user.username}")
                return Response(UserSerializer(request.user).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            logger.error(f"Profile update failed - ValidationError: {e}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Profile update failed - Unexpected error: {e}")
            return Response(
                {"error": "Failed to update profile. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Get current user's swap requests"""
        try:
            from swaps.models import SwapRequest
            from swaps.serializers import SwapRequestSerializer
            
            if not request.user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
                
            # Get swap requests where user is either requester or provider
            requests = SwapRequest.objects.filter(
                models.Q(requester=request.user) | models.Q(provider=request.user)
            ).order_by('-created_at')
            
            serializer = SwapRequestSerializer(requests, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to get user requests: {e}")
            return Response(
                {"error": "Failed to load requests. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search users by skills, name, or location"""
        try:
            query = request.query_params.get('q', '')
            if not query:
                return Response([])
                
            users = User.objects.filter(
                models.Q(first_name__icontains=query) |
                models.Q(last_name__icontains=query) |
                models.Q(username__icontains=query) |
                models.Q(bio__icontains=query) |
                models.Q(location__icontains=query),
                is_public=True,
                is_active=True
            ).exclude(role='admin')
            
            serializer = UserPublicSerializer(users, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"User search failed: {e}")
            return Response(
                {"error": "Search failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def admin_list(self, request):
        """Get all users for admin management"""
        try:
            users = User.objects.all().order_by('-joined_at')
            serializer = AdminUserSerializer(users, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Admin user list failed: {e}")
            return Response(
                {"error": "Failed to load users. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def admin_dashboard(self, request):
        """Get comprehensive admin dashboard data"""
        try:
            from swaps.models import SwapRequest
            from skills.models import Skill, UserSkill
            from ratings.models import Rating
            
            # Get user statistics
            total_users = User.objects.count()
            active_users = User.objects.filter(is_active=True).count()
            admin_users = User.objects.filter(role='admin').count()
            regular_users = User.objects.filter(role='user').count()
            
            # Get swap statistics
            total_swaps = SwapRequest.objects.count()
            pending_swaps = SwapRequest.objects.filter(status='pending').count()
            completed_swaps = SwapRequest.objects.filter(status='completed').count()
            cancelled_swaps = SwapRequest.objects.filter(status='cancelled').count()
            
            # Get skill statistics
            total_skills = Skill.objects.count()
            total_user_skills = UserSkill.objects.count()
            
            # Get all skills with user counts
            all_skills = []
            for skill in Skill.objects.all():
                user_count = UserSkill.objects.filter(skill=skill).count()
                all_skills.append({
                    'id': skill.id,
                    'name': skill.name,
                    'category': getattr(skill, 'category', 'General'),
                    'user_count': user_count
                })
            
            # Get rating statistics
            total_ratings = Rating.objects.count()
            avg_rating = Rating.objects.aggregate(avg=models.Avg('score'))['avg'] or 0
            
            # Get recent activity
            recent_users = User.objects.filter(is_active=True).order_by('-joined_at')[:10]
            recent_swaps = SwapRequest.objects.order_by('-created_at')[:10]
            
            # Get users with most swaps
            top_users = User.objects.annotate(
                swap_count=models.Count('sent_requests', distinct=True) + 
                          models.Count('received_requests', distinct=True)
            ).filter(is_active=True).order_by('-swap_count')[:5]
            
            dashboard_data = {
                'statistics': {
                    'users': {
                        'total': total_users,
                        'active': active_users,
                        'admin': admin_users,
                        'regular': regular_users
                    },
                    'swaps': {
                        'total': total_swaps,
                        'pending': pending_swaps,
                        'completed': completed_swaps,
                        'cancelled': cancelled_swaps
                    },
                                    'skills': {
                    'total': total_skills,
                    'user_skills': total_user_skills,
                    'all_skills': all_skills
                },
                    'ratings': {
                        'total': total_ratings,
                        'average': round(avg_rating, 2)
                    }
                },
                'recent_activity': {
                    'users': UserSerializer(recent_users, many=True).data,
                    'swaps': self._serialize_swaps(recent_swaps)
                },
                'top_users': UserSerializer(top_users, many=True).data
            }
            
            return Response(dashboard_data)
        except Exception as e:
            logger.error(f"Admin dashboard failed: {e}")
            return Response(
                {"error": "Failed to load dashboard data. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _serialize_swaps(self, swaps):
        """Helper method to serialize swap requests for admin"""
        return SwapRequestDetailSerializer(swaps, many=True).data

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def admin_users_detailed(self, request):
        """Get detailed user data for admin management"""
        try:
            users = User.objects.all().order_by('-joined_at')
            
            # Include related data
            user_data = []
            from swaps.models import SwapRequest
            for user in users:
                user_info = UserSerializer(user).data
                
                # Add swap statistics
                sent_swaps = SwapRequest.objects.filter(from_user=user).count()
                received_swaps = SwapRequest.objects.filter(to_user=user).count()
                completed_swaps = SwapRequest.objects.filter(
                    (models.Q(from_user=user) | models.Q(to_user=user)),
                    status='completed'
                ).count()
                
                # Add rating statistics
                from ratings.models import Rating
                user_ratings = Rating.objects.filter(to_user=user)
                avg_rating = user_ratings.aggregate(avg=models.Avg('score'))['avg'] or 0
                total_ratings = user_ratings.count()
                
                user_info.update({
                    'swap_stats': {
                        'sent': sent_swaps,
                        'received': received_swaps,
                        'completed': completed_swaps,
                        'total': sent_swaps + received_swaps
                    },
                    'rating_stats': {
                        'average': round(avg_rating, 2),
                        'total': total_ratings
                    }
                })
                
                user_data.append(user_info)
            
            return Response(user_data)
        except Exception as e:
            logger.error(f"Admin users detailed failed: {e}")
            return Response(
                {"error": "Failed to load detailed user data. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def admin_update(self, request, pk=None):
        """Update user as admin"""
        try:
            user = self.get_object()
            old_is_public = user.is_public
            old_is_active = user.is_active
            
            serializer = AdminUserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                # Send notification if visibility changed
                if 'is_public' in request.data and old_is_public != user.is_public:
                    from notifications.models import Notification
                    Notification.objects.create(
                        user=user,
                        title="Profile Visibility Updated",
                        message=f"Your profile is now {'public' if user.is_public else 'private'}.",
                        notification_type="admin_update"
                    )
                
                # Send notification if active status changed
                if 'is_active' in request.data and old_is_active != user.is_active:
                    from notifications.models import Notification
                    status = "activated" if user.is_active else "deactivated"
                    Notification.objects.create(
                        user=user,
                        title="Account Status Updated",
                        message=f"Your account has been {status} by an administrator.",
                        notification_type="admin_update"
                    )
                
                logger.info(f"Admin updated user: {user.username}")
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Admin user update failed: {e}")
            return Response(
                {"error": "Failed to update user. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def toggle_active(self, request, pk=None):
        """Toggle user active status"""
        try:
            user = self.get_object()
            user.is_active = not user.is_active
            user.save()
            
            action = "activated" if user.is_active else "deactivated"
            logger.info(f"Admin {action} user: {user.username}")
            
            return Response({
                "message": f"User {action} successfully",
                "is_active": user.is_active
            })
        except Exception as e:
            logger.error(f"Toggle user active failed: {e}")
            return Response(
                {"error": "Failed to update user status. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def ban(self, request, pk=None):
        """Ban user from platform"""
        try:
            user = self.get_object()
            user.is_active = False
            user.is_public = False
            user.save()
            
            logger.info(f"Admin banned user: {user.username}")
            
            return Response({
                "message": "User banned successfully",
                "is_banned": True
            })
        except Exception as e:
            logger.error(f"Ban user failed: {e}")
            return Response(
                {"error": "Failed to ban user. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def unban(self, request, pk=None):
        """Unban user from platform"""
        try:
            user = self.get_object()
            user.is_active = True
            user.is_public = True
            user.save()
            
            logger.info(f"Admin unbanned user: {user.username}")
            
            return Response({
                "message": "User unbanned successfully",
                "is_banned": False
            })
        except Exception as e:
            logger.error(f"Unban user failed: {e}")
            return Response(
                {"error": "Failed to unban user. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
