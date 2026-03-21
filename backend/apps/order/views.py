from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Order, DeliveryTracking

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """Create a new order"""
    try:
        data = request.data
        
        # Create order
        order = Order.objects.create(
            customer_name=data.get('customer_name', request.user.get_full_name() or request.user.username),
            customer_email=data.get('customer_email', request.user.email),
            customer_phone=data.get('customer_phone'),
            delivery_address=data.get('delivery_address'),
            items=data.get('items', {}),
            total_amount=data.get('total_amount'),
            status='pending',
            special_instructions=data.get('special_instructions', ''),
            payment_method=data.get('payment_method', 'cash_on_delivery'),
            user=request.user
        )
        
        # Create delivery tracking
        DeliveryTracking.objects.create(
            order=order,
            current_location='Restaurant',
            estimated_delivery_time=timezone.now() + timezone.timedelta(minutes=45)
        )
        
        return Response({
            'id': order.id,
            'order_number': f'QB{order.id:06d}',
            'status': order.status,
            'message': 'Order created successfully'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_orders(request):
    """Get orders for the authenticated user"""
    try:
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        
        orders_data = []
        for order in orders:
            orders_data.append({
                'id': order.id,
                'order_number': f'QB{order.id:06d}',
                'customer_name': order.customer_name,
                'customer_phone': order.customer_phone,
                'delivery_address': order.delivery_address,
                'items': order.items,
                'total_amount': order.total_amount,
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'delivery_time': order.delivery_time.isoformat() if order.delivery_time else None,
                'special_instructions': order.special_instructions,
                'payment_method': order.payment_method
            })
        
        return Response(orders_data)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_detail(request, order_id):
    """Get details of a specific order"""
    try:
        order = Order.objects.get(id=order_id, user=request.user)
        
        # Get delivery tracking if available
        tracking = None
        if hasattr(order, 'tracking'):
            tracking = {
                'current_location': order.tracking.current_location,
                'estimated_delivery_time': order.tracking.estimated_delivery_time.isoformat() if order.tracking.estimated_delivery_time else None,
                'delivery_notes': order.tracking.delivery_notes,
                'latitude': order.tracking.latitude,
                'longitude': order.tracking.longitude
            }
        
        order_data = {
            'id': order.id,
            'order_number': f'QB{order.id:06d}',
            'customer_name': order.customer_name,
            'customer_phone': order.customer_phone,
            'delivery_address': order.delivery_address,
            'items': order.items,
            'total_amount': order.total_amount,
            'status': order.status,
            'created_at': order.created_at.isoformat(),
            'delivery_time': order.delivery_time.isoformat() if order.delivery_time else None,
            'special_instructions': order.special_instructions,
            'payment_method': order.payment_method,
            'tracking': tracking
        }
        
        return Response(order_data)
        
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
