#!/usr/bin/env python
import os
import django

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quickbite.settings')

# Setup Django
django.setup()

print("Testing API imports...")

try:
    from apps.orders.models import Order
    print("✅ Orders model imported successfully")
    
    from apps.orders.serializers import OrderSerializer
    print("✅ Orders serializer imported successfully")
    
    from apps.api.views import admin_orders, admin_stats
    print("✅ API views imported successfully")
    
    print("\n🎉 All imports successful! Backend is ready.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
