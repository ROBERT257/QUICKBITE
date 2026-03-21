from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, MenuItem, Review
from .serializers import CategorySerializer, MenuItemSerializer, MenuItemListSerializer, ReviewSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'is_featured', 'spice_level', 'is_available']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MenuItemListSerializer
        return MenuItemSerializer
    
    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return MenuItem.objects.all()
        return MenuItem.objects.filter(is_available=True)
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
    
    @action(detail=False, methods=['post'])
    def bulk_update_availability(self, request):
        """Bulk update availability status"""
        item_ids = request.data.get('item_ids', [])
        is_available = request.data.get('is_available', True)
        
        updated = MenuItem.objects.filter(id__in=item_ids).update(is_available=is_available)
        return Response({
            'message': f'Updated {updated} items',
            'updated_count': updated
        })
    
    @action(detail=False, methods=['post'])
    def bulk_update_featured(self, request):
        """Bulk update featured status"""
        item_ids = request.data.get('item_ids', [])
        is_featured = request.data.get('is_featured', True)
        
        updated = MenuItem.objects.filter(id__in=item_ids).update(is_featured=is_featured)
        return Response({
            'message': f'Updated {updated} items',
            'updated_count': updated
        })
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MenuItemSerializer
        return MenuItemListSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_review(self, request, pk=None):
        menu_item = self.get_object()
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, menu_item=menu_item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_items = self.queryset.filter(is_featured=True)
        serializer = self.get_serializer(featured_items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category_id = request.query_params.get('category_id')
        if category_id:
            items = self.queryset.filter(category_id=category_id)
            serializer = self.get_serializer(items, many=True)
            return Response(serializer.data)
        return Response({'error': 'category_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
