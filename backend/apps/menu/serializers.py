from rest_framework import serializers
from .models import MenuItem, Review

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Review
        fields = ('id', 'user_name', 'rating', 'comment', 'created_at')
        read_only_fields = ('user',)

class MenuItemSerializer(serializers.ModelSerializer):
    average_rating = serializers.ReadOnlyField()
    reviews = ReviewSerializer(many=True, read_only=True)
    
    class Meta:
        model = MenuItem
        fields = '__all__'

class MenuItemListSerializer(serializers.ModelSerializer):
    average_rating = serializers.ReadOnlyField()
    
    class Meta:
        model = MenuItem
        fields = ('id', 'name', 'description', 'price', 'image', 
                 'is_available', 'is_featured', 'preparation_time', 'average_rating', 'spice_level')
