from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from .views import CustomLoginView


urlpatterns = [
    path('', views.index, name='index'),
    path('register/', views.register, name='register'),
    path('login/', CustomLoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('snap/', views.snap, name='snap'),
    path('home/', views.home, name='home'),
    path('explore/', views.explore, name='explore'),
    path('profile/', views.profile, name='profile'),
    path('notifications/', views.notifications, name='notifications'),
    path('toggle_favorites/', views.toggle_favorites, name='toggle_favorite'),
    path('load_more/', views.load_more, name='load_more'),
    path('upload/', views.upload, name='upload'),
    path('explore_more', views.explore_more, name='explore_more'),
    path('saves/', views.saves, name='saves')
]