from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_users(request):
    """Get all users for admin"""
    try:
        users = User.objects.all().order_by('-date_joined')
        
        users_data = []
        for user in users:
            users_data.append({
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}".strip(),
                'email': user.email,
                'role': 'Admin' if user.is_staff else 'Customer',
                'is_active': user.is_active,
                'joinDate': user.date_joined.strftime('%Y-%m-%d')
            })
        
        return Response(users_data)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_create_user(request):
    """Create new user"""
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name', '')
        role = request.data.get('role', 'customer')
        is_active = request.data.get('is_active', True)
        
        if not username or not email or not first_name:
            return Response(
                {'error': 'Username, email, and first_name are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_staff=(role == 'admin'),
            is_active=is_active
        )
        
        return Response({
            'id': user.id,
            'name': f"{user.first_name} {user.last_name}".strip(),
            'email': user.email,
            'role': 'Admin' if user.is_staff else 'Customer',
            'is_active': user.is_active,
            'joinDate': user.date_joined.strftime('%Y-%m-%d')
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_update_user(request, user_id):
    """Update user"""
    try:
        user = User.objects.get(id=user_id)
        
        email = request.data.get('email', user.email)
        first_name = request.data.get('first_name', user.first_name)
        last_name = request.data.get('last_name', user.last_name)
        role = request.data.get('role', 'customer')
        is_active = request.data.get('is_active', user.is_active)
        
        user.email = email
        user.first_name = first_name
        user.last_name = last_name
        user.is_staff = (role == 'admin')
        user.is_active = is_active
        user.save()
        
        return Response({
            'id': user.id,
            'name': f"{user.first_name} {user.last_name}".strip(),
            'email': user.email,
            'role': 'Admin' if user.is_staff else 'Customer',
            'is_active': user.is_active,
            'joinDate': user.date_joined.strftime('%Y-%m-%d')
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_delete_user(request, user_id):
    """Delete user"""
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        
        return Response({
            'message': 'User deleted successfully'
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
