from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    path('admin/login/', views.admin_login, name='admin_login'),
    path('admin/stats/', views.admin_stats, name='admin_stats'),
    path('admin/orders/', views.admin_orders, name='admin_orders'),
    path('admin/orders/<int:order_id>/status/', views.update_order_status, name='update_order_status'),
]
