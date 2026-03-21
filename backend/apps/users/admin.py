from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, UserProfile

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'role_badge', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('email', 'username', 'first_name', 'last_name', 'phone')
        }),
        ('Permissions', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )
    
    def role_badge(self, obj):
        colors = {
            'customer': '#3498db',
            'admin': '#e74c3c',
            'delivery': '#f39c12'
        }
        color = colors.get(obj.role, '#95a5a6')
        return format_html('<span style="background: {}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: capitalize;">{}</span>', color, obj.role)
    role_badge.short_description = 'Role'

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user_info', 'avatar_preview', 'bio', 'date_of_birth']
    search_fields = ['user__email', 'user__username', 'user__first_name', 'user__last_name']
    readonly_fields = ['avatar_preview']
    
    def user_info(self, obj):
        phone = obj.user.phone if hasattr(obj.user, 'phone') else 'N/A'
        return f"{obj.user.first_name} {obj.user.last_name} ({obj.user.email}) - {phone}"
    user_info.short_description = 'User Info'
    
    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 50%;" />', obj.avatar.url)
        return "No Avatar"
    avatar_preview.short_description = 'Avatar'
