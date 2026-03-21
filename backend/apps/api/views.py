from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db import models
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from apps.menu.models import MenuItem, Category

@api_view(['POST'])
@permission_classes([])
def admin_login(request):
    """Admin login endpoint"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # For demo purposes, accept admin/admin123
    if username == 'admin' and password == 'admin123':
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(username='admin')
        except User.DoesNotExist:
            user = User.objects.create_superuser(
                username='admin',
                email='admin@quickbite.com',
                password='admin123'
            )
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': {
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_staff
            }
        })
    
    # Try normal authentication
    user = authenticate(username=username, password=password)
    if user and user.is_staff:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': {
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_staff
            }
        })
    else:
        return Response(
            {'error': 'Invalid admin credentials'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_stats(request):
    """Get admin dashboard statistics"""
    try:
        from apps.order.models import Order
        
        total_items = MenuItem.objects.count()
        available_items = MenuItem.objects.filter(is_available=True).count()
        featured_items = MenuItem.objects.filter(is_featured=True).count()
        total_categories = Category.objects.count()
        
        today_orders = Order.objects.filter(
            created_at__date=timezone.now().date()
        ).count()
        
        pending_orders = Order.objects.exclude(
            status='delivered'
        ).count()
        
        completed_orders = Order.objects.filter(
            status='delivered'
        ).count()
        
        total_revenue = Order.objects.filter(
            status='delivered'
        ).aggregate(
            total=models.Sum('total_amount')
        )['total'] or 0
        
        return Response({
            'total_items': total_items,
            'available_items': available_items,
            'featured_items': featured_items,
            'total_categories': total_categories,
            'today_orders': today_orders,
            'pending_orders': pending_orders,
            'completed_orders': completed_orders,
            'total_revenue': total_revenue
        })
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_orders(request):
    """Get all orders for admin"""
    try:
        from apps.order.models import Order
        
        orders = Order.objects.all().order_by('-created_at')
        
        orders_data = []
        for order in orders:
            orders_data.append({
                'id': order.id,
                'customer_name': order.customer_name,
                'customer_phone': order.customer_phone,
                'customer_email': order.customer_email,
                'delivery_address': order.delivery_address,
                'total_amount': order.total_amount,
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'delivery_time': order.delivery_time.isoformat() if order.delivery_time else None,
                'items': order.items if hasattr(order, 'items') else []
            })
        
        return Response(orders_data)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_order_status(request, order_id):
    """Update order status"""
    try:
        from apps.order.models import Order
        
        order = Order.objects.get(id=order_id)
        new_status = request.data.get('status')
        
        valid_statuses = ['pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled']
        if new_status not in valid_statuses:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        
        # Set delivery time when order is marked as delivered
        if new_status == 'delivered' and not order.delivery_time:
            from django.utils import timezone
            order.delivery_time = timezone.now()
        
        order.save()
        
        return Response({
            'message': f'Order status updated to {new_status}',
            'status': new_status
        })
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
