from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
import logging
from django.db.models import Q
from .models import SwapRequest
from .serializers import (
    SwapRequestDetailSerializer, SwapRequestCreateSerializer,
    SwapRequestUpdateSerializer
)
from users.permissions import IsOwnerOrAdmin, IsAdminUser
from notifications.models import Notification

logger = logging.getLogger(__name__)

class SwapRequestViewSet(viewsets.ModelViewSet):
    """
    Swap request management
    """
    queryset = SwapRequest.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'updated_at', 'status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SwapRequestCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return SwapRequestUpdateSerializer
        return SwapRequestDetailSerializer
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsOwnerOrAdmin]
        return super().get_permissions()
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin can see all requests
        if user.is_admin:
            return SwapRequest.objects.all()
        
        # Users can only see requests they are involved in
        return SwapRequest.objects.filter(Q(from_user=user) | Q(to_user=user))
    
    def create(self, request, *args, **kwargs):
        """Create a new swap request"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Check if user is trying to send request to themselves
            if serializer.validated_data.get('to_user') == request.user:
                return Response(
                    {"error": "You cannot send a swap request to yourself"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the swap request
            swap_request = serializer.save(from_user=request.user)
            
            logger.info(f"Swap request created: {swap_request.id} by {request.user.username}")
            
            return Response(
                SwapRequestDetailSerializer(swap_request).data,
                status=status.HTTP_201_CREATED
            )
            
        except ValidationError as e:
            logger.error(f"Swap request creation failed - ValidationError: {e}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except IntegrityError as e:
            logger.error(f"Swap request creation failed - IntegrityError: {e}")
            return Response(
                {"error": "Failed to create swap request. Please try again."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Swap request creation failed - Unexpected error: {e}")
            return Response(
                {"error": "Failed to create swap request. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        """Update a swap request"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            
            # Check if user can update this request
            if not (request.user == instance.from_user or request.user == instance.to_user):
                return Response(
                    {"error": "You don't have permission to update this request"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            swap_request = serializer.save()
            
            logger.info(f"Swap request updated: {swap_request.id} by {request.user.username}")
            
            return Response(SwapRequestDetailSerializer(swap_request).data)
            
        except ValidationError as e:
            logger.error(f"Swap request update failed - ValidationError: {e}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Swap request update failed - Unexpected error: {e}")
            return Response(
                {"error": "Failed to update swap request. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_create(self, serializer):
        swap_request = serializer.save()
        
        # Create notification for recipient
        Notification.objects.create(
            user=swap_request.to_user,
            notification_type=Notification.Type.SWAP_REQUEST,
            title="New Swap Request",
            message=f"{swap_request.from_user.username} wants to swap {swap_request.skill_offered.name} for your {swap_request.skill_wanted.name}",
            related_object_id=swap_request.id,
            related_object_type="swap_request"
        )
    
    def perform_update(self, serializer):
        previous_status = serializer.instance.status
        swap_request = serializer.save()
        
        # Create notifications based on status change
        if previous_status != swap_request.status:
            if swap_request.status == SwapRequest.Status.ACCEPTED:
                # Notify requester that their request was accepted
                Notification.objects.create(
                    user=swap_request.from_user,
                    notification_type=Notification.Type.SWAP_ACCEPTED,
                    title="Swap Request Accepted",
                    message=f"{swap_request.to_user.username} accepted your swap request for {swap_request.skill_wanted.name}",
                    related_object_id=swap_request.id,
                    related_object_type="swap_request"
                )
            elif swap_request.status == SwapRequest.Status.REJECTED:
                # Notify requester that their request was rejected
                Notification.objects.create(
                    user=swap_request.from_user,
                    notification_type=Notification.Type.SWAP_REJECTED,
                    title="Swap Request Rejected",
                    message=f"{swap_request.to_user.username} declined your swap request for {swap_request.skill_wanted.name}",
                    related_object_id=swap_request.id,
                    related_object_type="swap_request"
                )
            elif swap_request.status == SwapRequest.Status.COMPLETED:
                # Notify both users that the swap is completed
                for user in [swap_request.from_user, swap_request.to_user]:
                    if user != self.request.user:  # Don't notify the user who marked it complete
                        Notification.objects.create(
                            user=user,
                            notification_type=Notification.Type.SWAP_COMPLETED,
                            title="Swap Completed",
                            message=f"Your skill swap has been marked as completed",
                            related_object_id=swap_request.id,
                            related_object_type="swap_request"
                        )
                
                # Update completed swaps count for both users
                for user in [swap_request.from_user, swap_request.to_user]:
                    user.total_completed_swaps += 1
                    user.save(update_fields=['total_completed_swaps'])
    
    @action(detail=False, methods=['get'])
    def sent(self, request):
        """Get swap requests sent by current user"""
        try:
            requests = SwapRequest.objects.filter(from_user=request.user).order_by('-created_at')
            serializer = SwapRequestDetailSerializer(requests, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to get sent requests: {e}")
            return Response(
                {"error": "Failed to load sent requests. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def received(self, request):
        """Get swap requests received by current user"""
        try:
            requests = SwapRequest.objects.filter(to_user=request.user).order_by('-created_at')
            serializer = SwapRequestDetailSerializer(requests, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to get received requests: {e}")
            return Response(
                {"error": "Failed to load received requests. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a swap request"""
        try:
            swap_request = self.get_object()
            
            # Check if user can accept this request
            if request.user != swap_request.to_user:
                return Response(
                    {"error": "Only the recipient can accept this request"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if swap_request.status != SwapRequest.Status.PENDING:
                return Response(
                    {"error": "This request cannot be accepted"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            swap_request.status = SwapRequest.Status.ACCEPTED
            swap_request.save()
            
            logger.info(f"Swap request accepted: {swap_request.id} by {request.user.username}")
            
            return Response({
                "message": "Swap request accepted successfully",
                "swap_request": SwapRequestDetailSerializer(swap_request).data
            })
            
        except Exception as e:
            logger.error(f"Accept swap request failed: {e}")
            return Response(
                {"error": "Failed to accept request. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a swap request"""
        try:
            swap_request = self.get_object()
            
            # Check if user can reject this request
            if request.user != swap_request.to_user:
                return Response(
                    {"error": "Only the recipient can reject this request"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if swap_request.status != SwapRequest.Status.PENDING:
                return Response(
                    {"error": "This request cannot be rejected"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            swap_request.status = SwapRequest.Status.REJECTED
            swap_request.save()
            
            logger.info(f"Swap request rejected: {swap_request.id} by {request.user.username}")
            
            return Response({
                "message": "Swap request rejected successfully",
                "swap_request": SwapRequestDetailSerializer(swap_request).data
            })
            
        except Exception as e:
            logger.error(f"Reject swap request failed: {e}")
            return Response(
                {"error": "Failed to reject request. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark a swap request as completed"""
        try:
            swap_request = self.get_object()
            
            # Check if user can complete this request
            if request.user not in [swap_request.from_user, swap_request.to_user]:
                return Response(
                    {"error": "You don't have permission to complete this request"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if swap_request.status != SwapRequest.Status.ACCEPTED:
                return Response(
                    {"error": "Only accepted requests can be completed"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            swap_request.status = SwapRequest.Status.COMPLETED
            swap_request.save()
            
            logger.info(f"Swap request completed: {swap_request.id} by {request.user.username}")
            
            return Response({
                "message": "Swap request completed successfully",
                "swap_request": SwapRequestDetailSerializer(swap_request).data
            })
            
        except Exception as e:
            logger.error(f"Complete swap request failed: {e}")
            return Response(
                {"error": "Failed to complete request. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['delete'])
    def cancel(self, request, pk=None):
        """Cancel a swap request (only requester can cancel)"""
        swap_request = self.get_object()
        
        # Only the requester can cancel
        if request.user != swap_request.from_user:
            return Response(
                {"error": "Only the requester can cancel a swap request"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if swap_request.status not in [SwapRequest.Status.PENDING, SwapRequest.Status.ACCEPTED]:
            return Response(
                {"error": "Only pending or accepted requests can be cancelled"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        swap_request.status = SwapRequest.Status.CANCELLED
        swap_request.save()
        
        # Create notification for provider
        Notification.objects.create(
            user=swap_request.to_user,
            notification_type=Notification.NotificationType.SWAP_CANCELLED,
            title="Swap Request Cancelled",
            message=f"{swap_request.from_user.username} cancelled the swap request.",
            related_object_id=swap_request.id
        )
        
        return Response({
            'message': 'Swap request cancelled',
            'swap_request': SwapRequestDetailSerializer(swap_request).data
        })
    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Get current user's swap requests (sent and received)"""
        sent_requests = SwapRequest.objects.filter(from_user=request.user)
        received_requests = SwapRequest.objects.filter(to_user=request.user)
        
        return Response({
            'sent_requests': SwapRequestDetailSerializer(sent_requests, many=True).data,
            'received_requests': SwapRequestDetailSerializer(received_requests, many=True).data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def monitor(self, request):
        """Admin endpoint to monitor all swap requests"""
        try:
            status_filter = request.query_params.get('status', '')
            queryset = SwapRequest.objects.all()
            
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            queryset = queryset.order_by('-created_at')
            serializer = SwapRequestDetailSerializer(queryset, many=True)
            
            return Response({
                "swap_requests": serializer.data,
                "total_count": queryset.count(),
                "status_filter": status_filter
            })
            
        except Exception as e:
            logger.error(f"Admin swap monitoring failed: {e}")
            return Response(
                {"error": "Failed to load swap requests. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
