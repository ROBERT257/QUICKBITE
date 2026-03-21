#!/usr/bin/env python
import os
import django
import requests
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quickbite.settings')
django.setup()

# Test AI recommendations
print("Testing AI Recommendations...")
try:
    response = requests.get('http://localhost:8000/api/ai/recommendations/')
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Personalized: {len(data['personalized'])} items")
    print(f"Popular: {len(data['popular'])} items")
    print(f"Time-based: {len(data['time_based'])} items")
    print("Recommendations API working!")
except Exception as e:
    print(f"Error: {e}")

# Test AI Search
print("\nTesting AI Search...")
try:
    search_data = {"query": "spicy food under 300"}
    response = requests.post(
        'http://localhost:8000/api/ai/search/',
        json=search_data,
        headers={'Content-Type': 'application/json'}
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Found {len(data['items'])} items for '{data['query']}'")
    print(f"Detected intents: {data['detected_intents']}")
    print("AI Search API working!")
except Exception as e:
    print(f"Error: {e}")

# Test Chat Assistant
print("\nTesting Chat Assistant...")
try:
    chat_data = {"message": "Help me pick lunch under KSh 300"}
    response = requests.post(
        'http://localhost:8000/api/ai/chat/',
        json=chat_data,
        headers={'Content-Type': 'application/json'}
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Bot reply: {data['reply']}")
    print(f"Recommended {len(data['items'])} items")
    print("Chat Assistant API working!")
except Exception as e:
    print(f"Error: {e}")

# Test Search Suggestions
print("\nTesting Search Suggestions...")
try:
    response = requests.get('http://localhost:8000/api/ai/suggestions/')
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Found {len(data)} suggestions")
    print("Search Suggestions API working!")
except Exception as e:
    print(f"Error: {e}")

print("\nAll AI APIs tested!")
