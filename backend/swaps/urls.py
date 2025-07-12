from django.urls import path
from . import views

urlpatterns = [
    # Swap requests
    path('', views.SwapRequestListCreateView.as_view(), name='swap-list-create'),
    path('<int:pk>/', views.SwapRequestDetailView.as_view(), name='swap-detail'),
    path('my-requests/', views.my_swap_requests, name='my-swap-requests'),
    
    # Swap request actions
    path('<int:request_id>/accept/', views.accept_swap_request, name='accept-swap'),
    path('<int:request_id>/reject/', views.reject_swap_request, name='reject-swap'),
    path('<int:request_id>/complete/', views.complete_swap_request, name='complete-swap'),
    
    # Ratings
    path('ratings/', views.RatingListCreateView.as_view(), name='rating-list-create'),
    path('<int:request_id>/rate/', views.rate_swap, name='rate-swap'),
    
    # Stats
    path('stats/', views.swap_stats, name='swap-stats'),
]
