from django.db import models
from django.contrib.auth import get_user_model
from apps.menu.models import MenuItem

User = get_user_model()

class UserPreference(models.Model):
    """Store user preferences for better recommendations"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    favorite_categories = models.ManyToManyField('menu.Category', blank=True)
    spice_level = models.CharField(max_length=20, choices=[
        ('mild', 'Mild'),
        ('medium', 'Medium'),
        ('hot', 'Hot'),
        ('extra_hot', 'Extra Hot')
    ], default='medium')
    budget_range = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    dietary_restrictions = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Preferences"

class SearchHistory(models.Model):
    """Track user search queries for better recommendations"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    query = models.CharField(max_length=200)
    detected_intents = models.JSONField(default=dict)
    results_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Search: {self.query} by {self.user.username if self.user else 'Anonymous'}"

class PopularItem(models.Model):
    """Track popular items for recommendations"""
    menu_item = models.OneToOneField(MenuItem, on_delete=models.CASCADE, related_name='popularity')
    order_count = models.IntegerField(default=0)
    view_count = models.IntegerField(default=0)
    rating_score = models.FloatField(default=0.0)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.menu_item.name} - {self.order_count} orders"

class RecommendationCache(models.Model):
    """Cache recommendations to improve performance"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    recommendation_type = models.CharField(max_length=20, choices=[
        ('personalized', 'Personalized'),
        ('popular', 'Popular'),
        ('time_based', 'Time Based'),
        ('mood_based', 'Mood Based')
    ])
    items = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    def __str__(self):
        return f"{self.recommendation_type} for {self.user.username if self.user else 'Anonymous'}"
