# api/views.py
import os
import pandas as pd
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.shortcuts import get_object_or_404

from .models import Problem, UserProfile, ChatMessage, CodeSubmission, UploadedFile
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserProfileSerializer,
    ProblemSerializer, ChatMessageSerializer, ChatHistorySerializer,
    CodeSubmissionSerializer, UploadedFileSerializer
)
from .utils import ChromaDBManager, OllamaClient, DatasetManager

# Initialize ChromaDB manager
chroma_manager = ChromaDBManager()
# Initialize dataset manager
dataset_manager = DatasetManager()

User = get_user_model()

def get_fallback_user():
    return User.objects.first()  # fallback to the first user in DB for dev mode

@api_view(['GET'])
@permission_classes([AllowAny])
def ping(request):
    return Response({"message": "pong"})

# Authentication views
class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])  # Temporarily open logout as well
def logout_view(request):
    if hasattr(request.user, 'auth_token'):
        request.user.auth_token.delete()
    return Response(status=status.HTTP_200_OK)

# Problem views
class ProblemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer

    def get_permissions(self):
        return [AllowAny()]  # Allow open access for dev

    def get_queryset(self):
        queryset = Problem.objects.all()
        topic = self.request.query_params.get('topic')
        difficulty = self.request.query_params.get('difficulty')
        
        if topic:
            queryset = queryset.filter(related_topics__icontains=topic)
        if difficulty:
            queryset = queryset.filter(difficulty__iexact=difficulty)
            
        return queryset

@api_view(['GET'])
@permission_classes([AllowAny])
def get_problem_by_topic(request):
    topic = request.query_params.get('topic', '')
    difficulty = request.query_params.get('difficulty', 'Easy')
    
    if not topic:
        return Response({'error': 'Topic is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    question = dataset_manager.get_question_from_dataset(topic, difficulty)
    if not question:
        return Response({'error': 'No matching questions found'}, status=status.HTTP_404_NOT_FOUND)
    
    problem, created = Problem.objects.get_or_create(
        title=question['title'],
        defaults={
            'description': question['description'],
            'difficulty': question['difficulty'],
            'related_topics': question['related_topics']
        }
    )
    
    return Response(ProblemSerializer(problem).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def guide_me(request):
    data = request.data
    title = data.get("title", "")
    description = data.get("description", "")

    if not title or not description:
        return Response({"error": "Title and description are required."}, status=400)

    response = OllamaClient.guide_user_through_question(title, description)
    return Response({"guide": response})

# Chat views
@api_view(['POST'])
@permission_classes([AllowAny])
def chat_message(request):
    user_message = request.data.get('message', '')
    

    if not user_message:
        return Response({'error': 'Message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)



    # user = request.user if request.user.is_authenticated else get_fallback_user()
    user = User.objects.get(id=1)
    user_chat = ChatMessage.objects.create(
        user=user,
        message_type='user',
        content=user_message
    )


    retrieved_concept = chroma_manager.query_concept(user_message)
    ai_response = OllamaClient.get_concept_explanation(user_message, retrieved_concept)

    bot_chat = ChatMessage.objects.create(
        user=user,
        message_type='bot',
        content=ai_response
    )
    print( ChatMessageSerializer(user_chat).data)
    print(ChatMessageSerializer(bot_chat).data)
    return Response({
        'user_message': ChatMessageSerializer(user_chat).data,
        'bot_response': ChatMessageSerializer(bot_chat).data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def chat_history(request):
    user = request.user if request.user.is_authenticated else get_fallback_user()
    messages = ChatMessage.objects.filter(user=user).order_by('timestamp')
    serializer = ChatHistorySerializer(messages, many=True)
    return Response(serializer.data)

# Code evaluation view
@api_view(['POST'])
@permission_classes([AllowAny])
def evaluate_code(request):
    problem_title = request.data.get('title')
    problem_description = request.data.get('description')
    user_code = request.data.get('code', '')

    if not problem_title or not user_code:
        return Response({'error': 'Title and code are required'}, status=400)

    feedback = OllamaClient.evaluate_code(problem_title, problem_description, user_code)
    return Response({'feedback': feedback})


# File upload view
@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def upload_file(request):
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    file_obj = request.FILES['file']
    user = request.user if request.user.is_authenticated else get_fallback_user()

    uploaded_file = UploadedFile.objects.create(
        user=user,
        file=file_obj,
        file_name=file_obj.name,
        file_type=file_obj.content_type
    )
    
    serializer = UploadedFileSerializer(uploaded_file, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)

# User profile view
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer

    def get_permissions(self):
        return [AllowAny()]  # Open for dev

    def get_object(self):
        if self.request.user.is_authenticated:
            return UserProfile.objects.get(user=self.request.user)
        return UserProfile.objects.first()  # Return any profile if not logged in (for dev only)
