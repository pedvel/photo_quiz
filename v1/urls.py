from django.urls import path
from django.contrib.auth import views as auth_views
from v1.authentication.login import CustomLoginView
from v1.authentication.register import register
from v1.authentication.profile import profile
from v1.bookmarks.views import toggle_favorites, saves
from v1.content.views import snap, home, explore, explore_more, load_more, upload
from v1.views.notifications import notifications
from v1.views.index import index 




urlpatterns = [
    path('', index, name='index'),
    path('register/', register, name='register'),
    path('login/', CustomLoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('snap/', snap, name='snap'),
    path('home/', home, name='home'),
    path('explore/', explore, name='explore'),
    path('profile/', profile, name='profile'),
    path('notifications/', notifications, name='notifications'),
    path('toggle_favorites/', toggle_favorites, name='toggle_favorite'),
    path('load_more/', load_more, name='load_more'),
    path('upload/', upload, name='upload'),
    path('explore_more/', explore_more, name='explore_more'),
    path('saves/', saves, name='saves')
]