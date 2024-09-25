from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from .views import CustomLoginView, ContentUploadView, snap, home


urlpatterns = [
    path('', views.index, name='index'),
    path('register/', views.register, name='register'),
    path('login/', CustomLoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('snap/', snap, name='snap'),
    path('api/upload/', ContentUploadView.as_view(), name='content-upload'),
    path('home/', home, name='home'),
    path('explore/', views.explore, name='explore'),
    path('profile/', views.profile, name='profile'),
    path('notifications/', views.notifications, name='notifications')
]