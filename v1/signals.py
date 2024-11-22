from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import login
from django.db.models.signals import post_save
from django.dispatch import receiver, Signal
from .models import UserSettings, User

user_registered = Signal()

@receiver(user_registered)
def login_user(sender, user, request, **kwargs):
    login(request, user)

@receiver(user_registered)
def set_user_settings(sender, user, is_subscribed, dark_mode, **kwargs):
    user_settings = UserSettings.objects.create(
        user=user, 
        suscribed = is_subscribed,
        dark_mode = dark_mode
     )

@receiver(user_registered)
def send_welcome_mail(sender, user, **kwargs):
    if user.email:
        send_mail(
            f'Welcome to Pixly, {user.name}!',
            '''Hi there,

Thank you for joining Pixly! We're thrilled to have you with us as we embark on this exciting journey. Your support means the world to us!

If you have any questions or feedback, please don't hesitate to reach out. We're here to help!

Cheers,
The Pixly Team
            ''',
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )
