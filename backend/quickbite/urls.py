from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_info(request):
    return JsonResponse({
        'message': 'QuickBite API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/',
            'menu': '/api/menu/',
            'orders': '/api/orders/',
            'admin': '/admin/'
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', api_info, name='api-info'),
    # path('api/auth/', include('apps.users.urls')),  # Will be added after initial setup
    path('api/menu/', include('apps.menu.urls')),
    path('api/orders/', include('apps.orders.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
