from django.contrib import admin
from django.utils.html import format_html
from django.http import HttpResponseRedirect
from django.contrib import messages
from .models import MenuItem, Review

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'spice_level', 'is_available', 'is_featured', 'image_preview', 'created_at']
    list_filter = ['is_available', 'is_featured', 'spice_level', 'created_at']
    search_fields = ['name', 'description']
    list_editable = ['is_available', 'is_featured']
    readonly_fields = ['image_preview']
    prepopulated_fields = {'name': ('name',)}
    actions = ['make_available', 'make_unavailable', 'make_featured', 'make_unfeatured', 'bulk_price_update']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description'),
            'classes': ('wide',),  # Make the container wider
        }),
        ('Pricing & Details', {
            'fields': ('price', 'spice_level', 'preparation_time'),
            'classes': ('wide',),
        }),
        ('Availability', {
            'fields': ('is_available', 'is_featured'),
            'classes': ('wide',),
        }),
        ('Media', {
            'fields': ('image', 'image_preview'),
            'classes': ('wide',),
        }),
    )
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="60" height="60" style="object-fit: cover; border-radius: 8px;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Image'
    
    def make_available(self, request, queryset):
        updated = queryset.update(is_available=True)
        self.message_user(request, f'{updated} items marked as available.')
    make_available.short_description = "Mark selected items as available"
    
    def make_unavailable(self, request, queryset):
        updated = queryset.update(is_available=False)
        self.message_user(request, f'{updated} items marked as unavailable.')
    make_unavailable.short_description = "Mark selected items as unavailable"
    
    def make_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} items marked as featured.')
    make_featured.short_description = "Mark selected items as featured"
    
    def make_unfeatured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'{updated} items unmarked as featured.')
    make_unfeatured.short_description = "Unmark selected items as featured"
    
    def bulk_price_update(self, request, queryset):
        # This would typically redirect to a custom view
        self.message_user(request, 'Bulk price update feature - implement custom view for this.')
    bulk_price_update.short_description = "Bulk update prices"

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['menu_item', 'user', 'rating_stars', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['menu_item__name', 'user__username', 'comment']
    readonly_fields = ['created_at', 'rating_stars']
    actions = ['approve_reviews', 'delete_negative_reviews']
    
    def rating_stars(self, obj):
        stars = '⭐' * obj.rating
        return format_html('<span style="color: #f39c12;">{}</span>', stars)
    rating_stars.short_description = 'Rating'
    
    def approve_reviews(self, request, queryset):
        # If you have an approved field
        updated = queryset.update(approved=True)
        self.message_user(request, f'{updated} reviews approved.')
    approve_reviews.short_description = "Approve selected reviews"
    
    def delete_negative_reviews(self, request, queryset):
        deleted_count, _ = queryset.filter(rating__lt=3).delete()
        self.message_user(request, f'{deleted_count} negative reviews deleted.')
    delete_negative_reviews.short_description = "Delete negative reviews (1-2 stars)"
