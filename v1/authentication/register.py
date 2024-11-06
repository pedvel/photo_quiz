from django.shortcuts import redirect, render
from django.core.mail import send_mail
from django.contrib.auth import login, get_backends
from photo_quiz.settings import EMAIL_HOST_USER
from v1.forms import UserForm
from v1.models import UserSettings
from v1.content.check import redirection_check


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
            backend = get_backends()[0]
            user.backend = f'{backend.__module__}.{backend.__class__.__name__}'
            suscribed = request.POST.get('subscribe', False)
            user_settings = UserSettings.objects.create(
                user = user,
                suscribed = bool(suscribed)
            )            
            user_settings.save()

            if user_settings.suscribed:
                file_path = 'subscribed_emails.txt'
                if user.email:
                    with open(file_path, 'a') as f:
                        f.write(f'{user.email}\n')

            send_mail(
                f'Welcome to Pixly, {user.name}!',      
                f'''Hi there,

Thank you for joining Pixly! We're thrilled to have you with us as we embark on this exciting journey. Your support means the world to us!

If you have any questions or feedback, please don't hesitate to reach out. We're here to help!

Cheers,
The Pixly Team
''',  
                EMAIL_HOST_USER,
                [user.email],       
                fail_silently=False,
            )
            login(request, user)
            
            return redirect('snap')
    else:
        form = UserForm()

    return render(request, 'register.html', {
        'form':form
    })