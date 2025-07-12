from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import SwapRequest, Rating
from .serializers import (
    SwapRequestSerializer, SwapRequestUpdateSerializer, 
    RatingSerializer, RatingCreateSerializer
)
from notifications.models import Notification


class SwapRequestListCreateView(generics.ListCreateAPIView):
    """List and create swap requests"""
    
    serializer_class = SwapRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return SwapRequest.objects.filter(
            Q(from_user=user) | Q(to_user=user)
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        swap_request = serializer.save()
        
        # Create notification for the recipient
        Notification.objects.create(
            recipient=swap_request.to_user,
            sender=swap_request.from_user,
            notification_type='swap_request',
            title='New Swap Request',
            message=f'{swap_request.from_user.full_name} wants to learn {swap_request.wanted_skill} and offers to teach {swap_request.offered_skill}',
            related_object_id=swap_request.id,
            related_object_type='swap_request'
        )


class SwapRequestDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update swap requests"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return SwapRequest.objects.filter(
            Q(from_user=user) | Q(to_user=user)
        )
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return SwapRequestUpdateSerializer
        return SwapRequestSerializer
    
    def perform_update(self, serializer):
        swap_request = serializer.save()
        
        # Update completed_at if status is completed
        if swap_request.status == 'completed' and not swap_request.completed_at:
            swap_request.completed_at = timezone.now()
            swap_request.save()
        
        # Create notification based on status change
        if swap_request.status in ['accepted', 'rejected', 'completed']:
            notification_types = {
                'accepted': 'swap_accepted',
                'rejected': 'swap_rejected',
                'completed': 'swap_completed'
            }
            
            Notification.objects.create(
                recipient=swap_request.from_user,
                sender=swap_request.to_user,
                notification_type=notification_types[swap_request.status],
                title=f'Swap Request {swap_request.status.title()}',
                message=f'Your swap request has been {swap_request.status}',
                related_object_id=swap_request.id,
                related_object_type='swap_request'
            )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_swap_requests(request):
    """Get user's swap requests organized by sent/received"""
    
    user = request.user
    
    sent_requests = SwapRequest.objects.filter(from_user=user)
    received_requests = SwapRequest.objects.filter(to_user=user)
    
    return Response({
        'sent': SwapRequestSerializer(sent_requests, many=True).data,
        'received': SwapRequestSerializer(received_requests, many=True).data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_swap_request(request, request_id):
    """Accept a swap request"""
    
    try:
        swap_request = SwapRequest.objects.get(
            id=request_id, 
            to_user=request.user, 
            status='pending'
        )
        
        swap_request.status = 'accepted'
        swap_request.save()
        
        # Create notification
        Notification.objects.create(
            recipient=swap_request.from_user,
            sender=swap_request.to_user,
            notification_type='swap_accepted',
            title='Swap Request Accepted!',
            message=f'{swap_request.to_user.full_name} accepted your swap request',
            related_object_id=swap_request.id,
            related_object_type='swap_request'
        )
        
        return Response({
            'message': 'Swap request accepted successfully',
            'swap_request': SwapRequestSerializer(swap_request).data
        })
    except SwapRequest.DoesNotExist:
        return Response(
            {'error': 'Swap request not found or not eligible for acceptance'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_swap_request(request, request_id):
    """Reject a swap request"""
    
    try:
        swap_request = SwapRequest.objects.get(
            id=request_id, 
            to_user=request.user, 
            status='pending'
        )
        
        swap_request.status = 'rejected'
        swap_request.save()
        
        # Create notification
        Notification.objects.create(
            recipient=swap_request.from_user,
            sender=swap_request.to_user,
            notification_type='swap_rejected',
            title='Swap Request Declined',
            message=f'{swap_request.to_user.full_name} declined your swap request',
            related_object_id=swap_request.id,
            related_object_type='swap_request'
        )
        
        return Response({
            'message': 'Swap request rejected successfully',
            'swap_request': SwapRequestSerializer(swap_request).data
        })
    except SwapRequest.DoesNotExist:
        return Response(
            {'error': 'Swap request not found or not eligible for rejection'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_swap_request(request, request_id):
    """Mark a swap request as completed"""
    
    try:
        swap_request = SwapRequest.objects.get(
            id=request_id,
            status='accepted'
        )
        
        # Check if user is part of the swap
        if request.user not in [swap_request.from_user, swap_request.to_user]:
            return Response(
                {'error': 'You are not part of this swap'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        swap_request.status = 'completed'
        swap_request.completed_at = timezone.now()
        swap_request.save()
        
        # Update user swap counts
        swap_request.from_user.total_swaps += 1
        swap_request.to_user.total_swaps += 1
        swap_request.from_user.save()
        swap_request.to_user.save()
        
        # Create notifications for both users
        other_user = swap_request.to_user if request.user == swap_request.from_user else swap_request.from_user
        
        Notification.objects.create(
            recipient=other_user,
            sender=request.user,
            notification_type='swap_completed',
            title='Swap Completed!',
            message=f'Your swap with {request.user.full_name} has been completed. Don\'t forget to rate the experience!',
            related_object_id=swap_request.id,
            related_object_type='swap_request'
        )
        
        return Response({
            'message': 'Swap marked as completed successfully',
            'swap_request': SwapRequestSerializer(swap_request).data
        })
    except SwapRequest.DoesNotExist:
        return Response(
            {'error': 'Swap request not found or not eligible for completion'}, 
            status=status.HTTP_404_NOT_FOUND
        )


class RatingListCreateView(generics.ListCreateAPIView):
    """List and create ratings"""
    
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Rating.objects.filter(
            Q(rater=user) | Q(rated_user=user)
        ).order_by('-created_at')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def rate_swap(request, request_id):
    """Rate a completed swap"""
    
    try:
        swap_request = SwapRequest.objects.get(
            id=request_id, 
            status='completed'
        )
        
        # Check if user is part of the swap
        if request.user not in [swap_request.from_user, swap_request.to_user]:
            return Response(
                {'error': 'You are not part of this swap'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Determine who is being rated
        rated_user = swap_request.to_user if request.user == swap_request.from_user else swap_request.from_user
        
        # Check if already rated
        if Rating.objects.filter(swap_request=swap_request, rater=request.user).exists():
            return Response(
                {'error': 'You have already rated this swap'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create rating
        rating_data = {
            'rating': request.data.get('rating'),
            'feedback': request.data.get('feedback', '')
        }
        
        rating = Rating.objects.create(
            swap_request=swap_request,
            rater=request.user,
            rated_user=rated_user,
            **rating_data
        )
        
        # Update user's average rating
        user_ratings = Rating.objects.filter(rated_user=rated_user)
        avg_rating = sum(r.rating for r in user_ratings) / user_ratings.count()
        rated_user.rating = round(avg_rating, 1)
        rated_user.save()
        
        # Create notification
        Notification.objects.create(
            recipient=rated_user,
            sender=request.user,
            notification_type='rating_received',
            title='New Rating Received',
            message=f'{request.user.full_name} rated your swap {rating.rating}/5 stars',
            related_object_id=rating.id,
            related_object_type='rating'
        )
        
        return Response({
            'message': 'Rating submitted successfully',
            'rating': RatingSerializer(rating).data
        }, status=status.HTTP_201_CREATED)
        
    except SwapRequest.DoesNotExist:
        return Response(
            {'error': 'Swap request not found or not completed'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def swap_stats(request):
    """Get swap statistics for the user"""
    
    user = request.user
    
    # Count swap requests by status
    sent_requests = SwapRequest.objects.filter(from_user=user)
    received_requests = SwapRequest.objects.filter(to_user=user)
    
    stats = {
        'sent_total': sent_requests.count(),
        'sent_pending': sent_requests.filter(status='pending').count(),
        'sent_accepted': sent_requests.filter(status='accepted').count(),
        'sent_completed': sent_requests.filter(status='completed').count(),
        
        'received_total': received_requests.count(),
        'received_pending': received_requests.filter(status='pending').count(),
        'received_accepted': received_requests.filter(status='accepted').count(),
        'received_completed': received_requests.filter(status='completed').count(),
        
        'total_completed': user.total_swaps,
        'average_rating': user.rating,
    }
    
    return Response(stats)
