from django.urls import path
from . import views
from . import admin_views

app_name = 'api'

urlpatterns = [
    path('admin/login/', views.admin_login, name='admin_login'),
    path('admin/stats/', views.admin_stats, name='admin_stats'),
    path('admin/orders/', views.admin_orders, name='admin_orders'),
    path('admin/orders/<int:order_id>/status/', views.update_order_status, name='update_order_status'),
    path('admin/users/', admin_views.admin_users, name='admin_users'),
    path('admin/users/', admin_views.admin_create_user, name='admin_create_user'),
    path('admin/users/<int:user_id>/', admin_views.admin_update_user, name='admin_update_user'),
    path('admin/users/<int:user_id>/', admin_views.admin_delete_user, name='admin_delete_user'),
]
