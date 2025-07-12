from django.urls import path
from . import views

urlpatterns = [
    # Skills management
    path('', views.SkillListView.as_view(), name='skill-list'),
    path('categories/', views.skill_categories, name='skill-categories'),
    
    # User skills
    path('my-skills/', views.my_skills, name='my-skills'),
    path('add/', views.add_skill_to_user, name='add-skill'),
    path('remove/<int:skill_id>/', views.remove_skill_from_user, name='remove-skill'),
    
    # User skill CRUD
    path('user-skills/', views.UserSkillListView.as_view(), name='user-skill-list'),
    path('user-skills/<int:pk>/', views.UserSkillDetailView.as_view(), name='user-skill-detail'),
    path('user-skills/user/<int:user_id>/', views.UserSkillListView.as_view(), name='user-skills-by-user'),
]
