from datetime import datetime, timedelta
from django.db.models import Count, Q, Avg
from django.utils import timezone
from apps.menu.models import MenuItem, Category
from apps.orders.models import Order, OrderItem
from .models import UserPreference, PopularItem, SearchHistory

class AIService:
    """Core AI service for food recommendations and search"""
    
    # Keyword patterns for intent detection
    INTENT_PATTERNS = {
        'price': {
            'cheap': {'min': 0, 'max': 300},
            'budget': {'min': 0, 'max': 300},
            'expensive': {'min': 800, 'max': 9999},
            'affordable': {'min': 0, 'max': 500},
            'under': {'pattern': r'under\s*k?sh?\s*(\d+)', 'extract_price': True}
        },
        'spice': {
            'spicy': {'min_spice': 'medium'},
            'mild': {'max_spice': 'mild'},
            'hot': {'min_spice': 'hot'},
            'extra_hot': {'min_spice': 'extra_hot'}
        },
        'diet': {
            'healthy': {'tags': ['healthy', 'low-calorie']},
            'vegetarian': {'tags': ['vegetarian', 'veg']},
            'vegan': {'tags': ['vegan', 'plant-based']},
            'light': {'tags': ['light', 'small']}
        },
        'time': {
            'fast': {'max_time': 15},
            'quick': {'max_time': 15},
            'slow': {'min_time': 30},
            'long': {'min_time': 30}
        },
        'meal_type': {
            'breakfast': {'categories': ['Breakfast'], 'time_range': (6, 11)},
            'lunch': {'categories': ['Lunch'], 'time_range': (11, 15)},
            'dinner': {'categories': ['Dinner'], 'time_range': (17, 22)},
            'snack': {'categories': ['Snacks'], 'time_range': (15, 17)}
        }
    }
    
    @classmethod
    def get_personalized_recommendations(cls, user, limit=10):
        """Get personalized recommendations based on user history"""
        if not user or user.is_anonymous:
            return cls.get_popular_items(limit)
        
        # Get user's order history
        user_orders = OrderItem.objects.filter(
            order__user=user,
            order__status='delivered'
        ).values('menu_item_id').annotate(
            order_count=Count('id')
        ).order_by('-order_count')[:5]
        
        # Get frequently ordered categories
        frequent_categories = MenuItem.objects.filter(
            id__in=[item['menu_item_id'] for item in user_orders]
        ).values_list('category_id', flat=True)
        
        # Recommend items from same categories
        recommendations = MenuItem.objects.filter(
            category_id__in=frequent_categories,
            is_available=True
        ).exclude(
            id__in=[item['menu_item_id'] for item in user_orders]
        ).order_by('?')[:limit]
        
        return list(recommendations)
    
    @classmethod
    def get_popular_items(cls, limit=10):
        """Get globally popular items"""
        # Get items with most orders in last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        popular = MenuItem.objects.filter(
            orderitem__order__created_at__gte=thirty_days_ago,
            is_available=True
        ).annotate(
            order_count=Count('orderitem')
        ).order_by('-order_count')[:limit]
        
        return list(popular)
    
    @classmethod
    def get_time_based_recommendations(cls, limit=10):
        """Get recommendations based on current time"""
        current_hour = datetime.now().hour
        
        # Define meal times
        if 6 <= current_hour < 11:  # Breakfast
            preferred_categories = ['Burgers', 'Drinks']  # Using available categories
        elif 11 <= current_hour < 15:  # Lunch
            preferred_categories = ['Burgers', 'Pizza']
        elif 17 <= current_hour < 22:  # Dinner
            preferred_categories = ['Pizza', 'Burgers']
        else:  # Late night
            preferred_categories = ['Drinks']
        
        recommendations = MenuItem.objects.filter(
            category__name__in=preferred_categories,
            is_available=True
        ).order_by('-is_featured', '?')[:limit]
        
        return list(recommendations)
    
    @classmethod
    def parse_natural_language_query(cls, query):
        """Parse natural language query to extract intents"""
        query_lower = query.lower()
        detected_intents = {}
        
        # Extract price range
        for keyword, config in cls.INTENT_PATTERNS['price'].items():
            if keyword in query_lower:
                if 'min' in config:
                    detected_intents['min_price'] = config['min']
                if 'max' in config:
                    detected_intents['max_price'] = config['max']
        
        # Extract spice level
        for keyword, config in cls.INTENT_PATTERNS['spice'].items():
            if keyword in query_lower:
                if 'min_spice' in config:
                    detected_intents['min_spice'] = config['min_spice']
                if 'max_spice' in config:
                    detected_intents['max_spice'] = config['max_spice']
        
        # Extract time constraints
        for keyword, config in cls.INTENT_PATTERNS['time'].items():
            if keyword in query_lower:
                if 'max_time' in config:
                    detected_intents['max_prep_time'] = config['max_time']
                if 'min_time' in config:
                    detected_intents['min_prep_time'] = config['min_time']
        
        # Extract dietary preferences
        for keyword, config in cls.INTENT_PATTERNS['diet'].items():
            if keyword in query_lower:
                detected_intents['tags'] = config.get('tags', [])
        
        return detected_intents
    
    @classmethod
    def search_with_intents(cls, query, limit=20):
        """Search menu items based on natural language query"""
        intents = cls.parse_natural_language_query(query)
        
        # Start with all available items
        queryset = MenuItem.objects.filter(is_available=True)
        
        # Apply price filters
        if 'min_price' in intents:
            queryset = queryset.filter(price__gte=intents['min_price'])
        if 'max_price' in intents:
            queryset = queryset.filter(price__lte=intents['max_price'])
        
        # Apply spice level filters
        if 'min_spice' in intents:
            spice_levels = ['mild', 'medium', 'hot', 'extra_hot']
            min_index = spice_levels.index(intents['min_spice'])
            queryset = queryset.filter(
                spice_level__in=spice_levels[min_index:]
            )
        if 'max_spice' in intents:
            spice_levels = ['mild', 'medium', 'hot', 'extra_hot']
            max_index = spice_levels.index(intents['max_spice'])
            queryset = queryset.filter(
                spice_level__in=spice_levels[:max_index + 1]
            )
        
        # Apply time filters
        if 'max_prep_time' in intents:
            queryset = queryset.filter(preparation_time__lte=intents['max_prep_time'])
        if 'min_prep_time' in intents:
            queryset = queryset.filter(preparation_time__gte=intents['min_prep_time'])
        
        # Apply text search
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(category__name__icontains=query)
            )
        
        # Order by relevance (featured items first, then by name)
        queryset = queryset.order_by('-is_featured', 'name')
        
        return list(queryset[:limit])
    
    @classmethod
    def generate_chat_response(cls, message, user=None):
        """Generate AI chat response"""
        intents = cls.parse_natural_language_query(message)
        items = cls.search_with_intents(message, limit=5)
        
        # Generate friendly response based on detected intents
        response_parts = []
        
        if 'max_price' in intents:
            response_parts.append(f"under KSh {intents['max_price']}")
        
        if 'min_spice' in intents:
            spice_map = {'mild': 'mild', 'medium': 'medium-spicy', 'hot': 'spicy', 'extra_hot': 'extra spicy'}
            response_parts.append(f"{spice_map.get(intents['min_spice'], 'spicy')}")
        
        if 'max_prep_time' in intents:
            response_parts.append(f"quick (under {intents['max_prep_time']} mins)")
        
        # Build response
        if response_parts:
            response = f"Here are some great {' '.join(response_parts)} options:"
        else:
            response = "Here are some delicious options I found for you:"
        
        return {
            'reply': response,
            'items': items,
            'detected_intents': intents
        }
