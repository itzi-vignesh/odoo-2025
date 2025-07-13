"""
URL configuration for talent_bridge project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
import csv

from users.views import RegisterView, CustomTokenObtainPairView, UserViewSet
from skills.views import SkillViewSet, UserSkillViewSet
from swaps.views import SwapRequestViewSet
from ratings.views import RatingViewSet
from notifications.views import NotificationViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'user-skills', UserSkillViewSet, basename='user-skills')
router.register(r'swaps', SwapRequestViewSet, basename='swaps')
router.register(r'ratings', RatingViewSet, basename='ratings')
router.register(r'notifications', NotificationViewSet, basename='notifications')

class AdminReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    def get(self, request, report_type):
        # Dummy CSV report for demonstration
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{report_type}_report.csv"'
        writer = csv.writer(response)
        if report_type == 'user_activity':
            writer.writerow(['User', 'Activity'])
            writer.writerow(['alice', 'Logged in'])
            writer.writerow(['bob', 'Requested swap'])
        elif report_type == 'feedback_logs':
            writer.writerow(['User', 'Feedback'])
            writer.writerow(['alice', 'Great swap!'])
        elif report_type == 'swap_stats':
            writer.writerow(['Total Swaps', 'Completed'])
            writer.writerow([10, 7])
        else:
            writer.writerow(['Unknown report type'])
        return response

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication endpoints
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API endpoints
    path('api/', include(router.urls)),
    path('api/admin/reports/<str:report_type>/', AdminReportView.as_view(), name='admin-reports'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
