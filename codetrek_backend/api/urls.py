# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import ping

router = DefaultRouter()
router.register(r'problems', views.ProblemViewSet)

urlpatterns = [
    path('ping/', ping),
    
    # Authentication URLs
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # Problem URLs
    path('problem-by-topic/', views.get_problem_by_topic, name='problem-by-topic'),
    
    # Chat URLs
    path('chat/', views.chat_message, name='chat'),
    path('chat/history/', views.chat_history, name='chat-history'),
    path('guide-me/', views.guide_me, name='guide-me'),


    # Code evaluation URL
    path('evaluate-code/', views.evaluate_code, name='evaluate-code'),

    # File upload URL
    path('upload-file/', views.upload_file, name='upload-file'),

    # User profile URL
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),

    # Include DRF router URLs (e.g. /problems/)
    path('', include(router.urls)),
]
