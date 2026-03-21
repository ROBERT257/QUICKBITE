from django.urls import path
from . import views

urlpatterns = [
    path('recommendations/', views.recommendations, name='ai-recommendations'),
    path('search/', views.AISearchView.as_view(), name='ai-search'),
    path('chat/', views.chat_assistant, name='ai-chat'),
    path('suggestions/', views.search_suggestions, name='search-suggestions'),
]
