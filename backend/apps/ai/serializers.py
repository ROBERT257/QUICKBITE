from rest_framework import serializers
from apps.menu.serializers import MenuItemListSerializer

class RecommendationSerializer(serializers.Serializer):
    personalized = MenuItemListSerializer(many=True, read_only=True)
    popular = MenuItemListSerializer(many=True, read_only=True)
    time_based = MenuItemListSerializer(many=True, read_only=True)

class AISearchSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=200)
    limit = serializers.IntegerField(default=20, min_value=1, max_value=50)

class ChatMessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=500)

class ChatResponseSerializer(serializers.Serializer):
    reply = serializers.CharField()
    items = MenuItemListSerializer(many=True, read_only=True)
    detected_intents = serializers.JSONField(default=dict)

class SearchSuggestionSerializer(serializers.Serializer):
    text = serializers.CharField()
    query = serializers.CharField()
    icon = serializers.CharField()
