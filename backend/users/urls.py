from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    
    # Profile endpoints
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/update/', views.ProfileUpdateView.as_view(), name='profile-update'),
    
    # User discovery
    path('discover/', views.UserDiscoveryView.as_view(), name='user-discovery'),
    path('user/<int:user_id>/', views.UserDetailView.as_view(), name='user-detail'),
    
    # Badge endpoints
    path('badges/', views.UserBadgeListView.as_view(), name='user-badges'),
    path('badges/available/', views.AvailableBadgesView.as_view(), name='available-badges'),
    
    # Admin endpoints
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:user_id>/toggle-status/', views.toggle_user_status, name='toggle-user-status'),
    
    # Stats
    path('stats/', views.user_stats, name='user-stats'),
]
