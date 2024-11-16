from django.shortcuts import redirect, render
from django.core.mail import send_mail
from django.contrib.auth import login, get_backends
from photo_quiz.settings import EMAIL_HOST_USER
from v1.forms import UserForm
from v1.models import UserSettings, User
from v1.content.check import redirection_check
from v1.signals import user_registered


def register(request):
    form = UserForm()
    redirection = redirection_check(request)
    if redirection:
        return redirection

    if request.method == 'POST':
        form = UserForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()

            is_subscribed=request.POST.get('subscribe', False)
            #ACA AGREGAR LA PREFERENCIA DE DARK O LIGHT MODE
            user_registered.send(sender=User, user=user, request=request, is_subscribed=bool(is_subscribed))

            return redirect('snap')
    else:
        form = UserForm()

    return render(request, 'register.html', {
        'form':form
    })






