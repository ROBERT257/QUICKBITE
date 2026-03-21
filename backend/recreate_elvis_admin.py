#!/usr/bin/env python
import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quickbite.settings')
django.setup()

from apps.users.models import User

def recreate_elvis_as_admin():
    """Remove ELVIS user and recreate as admin"""
    try:
        # Find ELVIS user
        elvis = User.objects.filter(username__iexact='ELVIS').first()
        
        if elvis:
            print(f"Found ELVIS user: {elvis.username}")
            
            # Delete ELVIS user
            elvis.delete()
            print("ELVIS user deleted successfully")
            
            # Create ELVIS as admin
            elvis.is_staff = True
            elvis.is_superuser = True
            elvis.save()
            print(f"ELVIS recreated as admin: {elvis.username}")
            print("✅ ELVIS is now admin user")
            return True
        else:
            print("❌ ELVIS user not found in database")
            return False
            
    except Exception as e:
        print(f"❌ Error recreating ELVIS: {e}")
        return False

def check_elvis_status():
    """Check current ELVIS status"""
    try:
        elvis = User.objects.filter(username__iexact='ELVIS').first()
        if elvis:
            print(f"✅ ELVIS Status:")
            print(f"   Username: {elvis.username}")
            print(f"   Is Staff: {elvis.is_staff}")
            print(f"   Is Superuser: {elvis.is_superuser}")
            print(f"   Email: {elvis.email}")
            print(f"   Active: {elvis.is_active}")
            return True
        else:
            print("❌ ELVIS not found in database")
            return False
    except Exception as e:
        print(f"❌ Error checking ELVIS: {e}")
        return False

if __name__ == '__main__':
    print("=== ELVIS Admin Recreation Script ===")
    
    # Check current status
    print("1. Checking current ELVIS status...")
    check_elvis_status()
    
    print("\n2. Recreating ELVIS as admin...")
    if recreate_elvis_as_admin():
        print("✅ ELVIS successfully recreated as admin!")
        print("\n3. ELVIS now has full admin access!")
        print("\n=== Operation Complete ===")
    else:
        print("❌ Failed to recreate ELVIS as admin")
        print("\n=== Operation Failed ===")
