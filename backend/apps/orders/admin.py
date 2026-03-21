from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem, OrderTracking

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['subtotal']
    
    def subtotal(self, obj):
        return f"KES {obj.price * obj.quantity}"
    subtotal.short_description = 'Subtotal'

class OrderTrackingInline(admin.TabularInline):
    model = OrderTracking
    extra = 0
    readonly_fields = ['timestamp']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer_info', 'total_amount', 'status_badge', 'payment_method', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['order_number', 'user__username', 'user__email']
    readonly_fields = ['order_number', 'created_at', 'total_amount']
    inlines = [OrderItemInline, OrderTrackingInline]
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'phone_number')
        }),
        ('Delivery Details', {
            'fields': ('delivery_address', 'special_instructions')
        }),
        ('Order Status', {
            'fields': ('status', 'payment_method', 'payment_status')
        }),
    )
    
    def customer_info(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name} ({obj.user.email})"
    customer_info.short_description = 'Customer'
    
    def status_badge(self, obj):
        colors = {
            'pending': '#f39c12',
            'confirmed': '#3498db',
            'preparing': '#9b59b6',
            'ready': '#2ecc71',
            'delivering': '#e67e22',
            'delivered': '#27ae60',
            'cancelled': '#e74c3c'
        }
        color = colors.get(obj.status, '#95a5a6')
        return format_html('<span style="background: {}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">{}</span>', color, obj.get_status_display())
    status_badge.short_description = 'Status'

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(user=request.user)

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'menu_item', 'quantity', 'price', 'subtotal']
    list_filter = ['order__status', 'menu_item']
    search_fields = ['order__order_number', 'menu_item__name']
    readonly_fields = ['subtotal']
    
    def subtotal(self, obj):
        return f"KES {obj.price * obj.quantity}"
    subtotal.short_description = 'Subtotal'

@admin.register(OrderTracking)
class OrderTrackingAdmin(admin.ModelAdmin):
    list_display = ['order', 'status', 'timestamp', 'notes']
    list_display = ['order', 'status', 'timestamp', 'updated_by']
    list_filter = ['status', 'timestamp']
    search_fields = ['order__order_number', 'notes']
    readonly_fields = ('timestamp',)
