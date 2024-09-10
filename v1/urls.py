from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from .views import CustomLoginView, ContentUploadView, dashboard, home


urlpatterns = [
    path('', views.index, name='index'),
    path('v1/register/', views.register, name='register'),
    path('v1/login/', CustomLoginView.as_view(template_name='v1/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('dashboard/', dashboard, name='dashboard'),
    path('api/upload/', ContentUploadView.as_view(), name='content-upload'),
    path('v1/home', home, name='home'),
]