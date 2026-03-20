from django.contrib import admin
from .models import Category, MenuItem, Review

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'is_available', 'is_featured', 'created_at']
    list_filter = ['category', 'is_available', 'is_featured', 'spice_level']
    search_fields = ['name', 'description']
    list_editable = ['is_available', 'is_featured']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['menu_item', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['menu_item__name', 'user__username']
