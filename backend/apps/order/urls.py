from django.urls import path
from . import views

app_name = 'order'

urlpatterns = [
    path('', views.create_order, name='create_order'),
    path('my/', views.get_user_orders, name='get_user_orders'),
    path('<int:order_id>/', views.get_order_detail, name='get_order_detail'),
]
