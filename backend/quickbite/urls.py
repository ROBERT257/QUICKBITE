from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.generic import TemplateView

def api_info(request):
    return JsonResponse({
        'message': 'QuickBite API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/',
            'menu': '/api/menu/',
            'orders': '/api/orders/',
            'admin': '/api/',
            'ai': '/api/ai/'
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_info, name='api-info'),
    path('api/auth/', include('apps.users.urls')),
    path('api/menu/', include('apps.menu.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/ai/', include('apps.ai.urls')),
    path('api/', include('apps.api.urls')),
    
    # Frontend routes - serve React app
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('login/', TemplateView.as_view(template_name='index.html'), name='login'),
    path('signup/', TemplateView.as_view(template_name='index.html'), name='signup'),
    path('profile/', TemplateView.as_view(template_name='index.html'), name='profile'),
    path('menu/', TemplateView.as_view(template_name='index.html'), name='menu'),
    path('orders/', TemplateView.as_view(template_name='index.html'), name='orders'),
    path('order/', TemplateView.as_view(template_name='index.html'), name='order'),
    path('admin-dashboard/', TemplateView.as_view(template_name='index.html'), name='admin-dashboard'),
    path('chef/', TemplateView.as_view(template_name='index.html'), name='chef'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
