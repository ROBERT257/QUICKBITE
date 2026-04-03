#!/usr/bin/env python
import os
import sys

print("Starting Django test...")

# Add the project directory to Python path
sys.path.insert(0, r'C:\xampp\htdocs\QUICKBITE\QUICKBITE\backend')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quickbite.settings')

try:
    import django
    django.setup()
    print("✅ Django setup successful")
    
    # Test basic imports
    from django.contrib.auth import get_user_model
    print("✅ Django auth imported")
    
    from apps.users.models import User
    print("✅ Users model imported")
    
    from apps.orders.models import Order
    print("✅ Orders model imported")
    
    from apps.api.views import admin_login
    print("✅ API views imported")
    
    print("\n🎉 ALL IMPORTS SUCCESSFUL!")
    
except ImportError as e:
    print(f"❌ Import Error: {e}")
except Exception as e:
    print(f"❌ General Error: {e}")
    import traceback
    traceback.print_exc()
