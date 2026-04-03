from rest_framework import serializers
from .models import Order, OrderItem, OrderTracking
from apps.menu.serializers import MenuItemListSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item = MenuItemListSerializer(read_only=True)
    menu_item_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = ('id', 'menu_item', 'menu_item_id', 'quantity', 'price', 'special_instructions', 'subtotal')

class OrderTrackingSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = OrderTracking
        fields = ('id', 'status', 'timestamp', 'notes', 'updated_by_name')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    tracking = OrderTrackingSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('user', 'order_number', 'total_amount', 'created_at', 'updated_at')

class CreateOrderSerializer(serializers.ModelSerializer):
    items = serializers.ListField(child=serializers.DictField())
    
    class Meta:
        model = Order
        fields = ('payment_method', 'delivery_address', 'phone_number', 'special_instructions', 'items')
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        
        # Calculate subtotal
        subtotal = sum(item['quantity'] * item['price'] for item in items_data)
        delivery_fee = 150  # Fixed delivery fee
        total_amount = subtotal + delivery_fee
        
        order = Order.objects.create(
            user=user,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total_amount=total_amount,
            **validated_data
        )
        
        # Create order items
        for item_data in items_data:
            OrderItem.objects.create(
                order=order,
                menu_item_id=item_data['menu_item_id'],
                quantity=item_data['quantity'],
                price=item_data['price'],
                special_instructions=item_data.get('special_instructions', '')
            )
        
        # Create initial tracking
        OrderTracking.objects.create(
            order=order,
            status='pending',
            notes='Order placed successfully'
        )
        
        return order

class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('status',)
