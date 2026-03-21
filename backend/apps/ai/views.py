from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import AnonymousUser
from .services import AIService
from .serializers import (
    RecommendationSerializer, 
    AISearchSerializer, 
    ChatMessageSerializer,
    ChatResponseSerializer,
    SearchSuggestionSerializer
)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def recommendations(request):
    """Get AI-powered recommendations"""
    user = request.user if not isinstance(request.user, AnonymousUser) else None
    
    personalized = AIService.get_personalized_recommendations(user, limit=5)
    popular = AIService.get_popular_items(limit=5)
    time_based = AIService.get_time_based_recommendations(limit=5)
    
    serializer = RecommendationSerializer({
        'personalized': personalized,
        'popular': popular,
        'time_based': time_based
    })
    
    return Response(serializer.data)

class AISearchView(APIView):
    """AI-powered natural language search"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = AISearchSerializer(data=request.data)
        if serializer.is_valid():
            query = serializer.validated_data['query']
            limit = serializer.validated_data['limit']
            
            # Store search history
            from .models import SearchHistory
            SearchHistory.objects.create(
                user=request.user if not isinstance(request.user, AnonymousUser) else None,
                query=query,
                detected_intents=AIService.parse_natural_language_query(query)
            )
            
            # Perform AI search
            items = AIService.search_with_intents(query, limit)
            
            # Serialize results
            from apps.menu.serializers import MenuItemListSerializer
            items_serializer = MenuItemListSerializer(items, many=True)
            
            return Response({
                'items': items_serializer.data,
                'query': query,
                'detected_intents': AIService.parse_natural_language_query(query)
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def chat_assistant(request):
    """AI chat assistant for food recommendations"""
    serializer = ChatMessageSerializer(data=request.data)
    if serializer.is_valid():
        message = serializer.validated_data['message']
        user = request.user if not isinstance(request.user, AnonymousUser) else None
        
        # Generate AI response
        response_data = AIService.generate_chat_response(message, user)
        
        # Serialize response
        response_serializer = ChatResponseSerializer(response_data)
        
        return Response(response_serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_suggestions(request):
    """Get search suggestions for the smart search bar"""
    suggestions = [
        {'text': 'Spicy meals', 'query': 'spicy', 'icon': '🌶️'},
        {'text': 'Lunch under KSh 300', 'query': 'lunch under 300', 'icon': '💰'},
        {'text': 'Healthy options', 'query': 'healthy', 'icon': '🥗'},
        {'text': 'Quick bites', 'query': 'fast', 'icon': '⚡'},
        {'text': 'Budget-friendly', 'query': 'cheap', 'icon': '💵'},
        {'text': 'Mild flavors', 'query': 'mild', 'icon': '😊'},
        {'text': 'Something heavy', 'query': 'heavy', 'icon': '🍽️'},
        {'text': 'Vegetarian options', 'query': 'vegetarian', 'icon': '🥬'},
    ]
    
    serializer = SearchSuggestionSerializer(suggestions, many=True)
    return Response(serializer.data)
