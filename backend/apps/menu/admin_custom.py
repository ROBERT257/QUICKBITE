"""
Enhanced Admin Configuration for QuickBite
This provides additional admin customization for better UI/UX
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Category, MenuItem, Review

class EnhancedCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'item_count', 'image_preview', 'created_at']
    search_fields = ['name']
    readonly_fields = ['image_preview', 'item_count']
    
    def item_count(self, obj):
        count = obj.menuitem_set.count()
        return format_html('<span style="background: #3498db; color: white; padding: 4px 8px; border-radius: 4px;">{}</span>', count)
    item_count.short_description = 'Items'
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 8px;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Preview'

class EnhancedMenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'spice_badge', 'availability_status', 'image_preview', 'created_at']
    list_filter = ['category', 'is_available', 'is_featured', 'spice_level']
    search_fields = ['name', 'description']
    list_editable = ['is_available', 'is_featured']
    readonly_fields = ['image_preview', 'spice_badge']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category')
        }),
        ('Pricing & Details', {
            'fields': ('price', 'spice_level', 'preparation_time')
        }),
        ('Availability', {
            'fields': ('is_available', 'is_featured')
        }),
        ('Media', {
            'fields': ('image', 'image_preview')
        }),
    )
    
    def spice_badge(self, obj):
        colors = {
            'mild': '#2ecc71',
            'medium': '#f39c12', 
            'hot': '#e67e22',
            'extra_hot': '#e74c3c'
        }
        color = colors.get(obj.spice_level, '#95a5a6')
        return format_html('<span style="background: {}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: capitalize;">{}</span>', color, obj.spice_level)
    spice_badge.short_description = 'Spice Level'
    
    def availability_status(self, obj):
        if obj.is_available:
            return format_html('<span style="background: #27ae60; color: white; padding: 4px 8px; border-radius: 4px;">✓ Available</span>')
        return format_html('<span style="background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px;">✗ Unavailable</span>')
    availability_status.short_description = 'Status'
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="60" height="60" style="object-fit: cover; border-radius: 8px;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Image'

# Replace the default admin registration
admin.site.unregister(Category)
admin.site.unregister(MenuItem)
admin.site.register(Category, EnhancedCategoryAdmin)
admin.site.register(MenuItem, EnhancedMenuItemAdmin)
