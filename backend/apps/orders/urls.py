from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, update_order_status, test_endpoint

router = DefaultRouter()
router.register(r'', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:pk>/update_status/', update_order_status, name='order-update-status'),
    path('test/', test_endpoint, name='test-endpoint'),
]
