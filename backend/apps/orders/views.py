from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order, OrderTracking
from .serializers import OrderSerializer, CreateOrderSerializer, OrderStatusUpdateSerializer, OrderTrackingSerializer

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_method']
    search_fields = ['order_number', 'delivery_address']
    ordering_fields = ['created_at', 'total_amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Order.objects.all()
        return Order.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        if self.action == 'update_status':
            return OrderStatusUpdateSerializer
        return OrderSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        # Return full order details
        response_serializer = OrderSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def admin_orders(self, request):
        """Get all orders for admin dashboard"""
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        orders = Order.objects.all().order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def dashboard_orders(self, request):
        """Get all orders for dashboard display (no auth required for development)"""
        orders = Order.objects.all().order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.AllowAny])
    def update_status(self, request, pk=None):
        order = self.get_object()
        # Remove admin role check for development
        
        print(f"Updating order {pk} status from {order.status} to {request.data}")
        
        serializer = OrderStatusUpdateSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            old_status = order.status
            order = serializer.save()
            
            print(f"Successfully updated order {pk} status to {order.status}")
            
            # Create tracking entry
            if request.user and request.user.is_authenticated:
                OrderTracking.objects.create(
                    order=order,
                    status=order.status,
                    notes=f"Status changed from {old_status} to {order.status}",
                    updated_by=request.user
                )
            
            return Response(OrderSerializer(order).data)
        else:
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Alternative function-based view for status update
@api_view(['PATCH'])
@permission_classes([permissions.AllowAny])
def update_order_status(request, pk):
    print(f"Function view called: {request.method} {pk}")
    
    try:
        order = Order.objects.get(pk=pk)
        print(f"Function view: Updating order {pk} status from {order.status} to {request.data}")
        
        serializer = OrderStatusUpdateSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            old_status = order.status
            order = serializer.save()
            
            print(f"Function view: Successfully updated order {pk} status to {order.status}")
            
            # Create tracking entry
            if request.user and request.user.is_authenticated:
                OrderTracking.objects.create(
                    order=order,
                    status=order.status,
                    notes=f"Status changed from {old_status} to {order.status}",
                    updated_by=request.user
                )
            
            return Response(OrderSerializer(order).data)
        else:
            print(f"Function view: Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Order.DoesNotExist:
        print(f"Function view: Order {pk} not found")
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Function view: Exception: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Simple test endpoint
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def test_endpoint(request):
    return Response({'message': 'Orders app is working!'})
    
    @action(detail=True, methods=['get'])
    def tracking(self, request, pk=None):
        order = self.get_object()
        tracking = order.tracking.all()
        serializer = OrderTrackingSerializer(tracking, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        orders = Order.objects.filter(user=request.user)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
