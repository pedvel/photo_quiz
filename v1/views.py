
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import redirect, render
from .utils import completed_quizzes, get_quiz, existing_content, redirection_check, correct_image_orientation, get_favorites
from .forms import UserForm, ContentForm
from .models import Content, UserSettings, Favorites
from django.contrib.auth.views import LoginView
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from django.contrib.auth import login, get_backends
from PIL import Image
from django.core.files.base import ContentFile
import io
from collections import defaultdict
from django.core.mail import send_mail
from photo_quiz.settings import EMAIL_HOST_USER



# Create your views here.
class CustomLoginView(LoginView):
    template_name='login.html'
    
    def get(self, request, *args, **kwargs):
        
        #CHECK IF USER LOGGED-IN, AND IF COMPLETED DAY'S THEME
        redirection = redirection_check(request)
        if redirection:
            return redirection
            
        return super().get(request, *args, **kwargs)
    
    def get_success_url(self):
        user = self.request.user
        #CHECK IF USER ALREADY COMPLETED DAY'S THEME AND REDIRECT ACCORDINGLY
        if existing_content(user):
            return reverse_lazy('home')
        else:
            return reverse_lazy('snap')


def index(request):
    redirection = redirection_check(request)
    if redirection:
        return redirection

    return render(request, 'index.html')

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
                f'{user.name}, welcome to Pixly',               # Asunto del correo
                f'Este es el cuerpo del mensaje para {user.name}.',  # Cuerpo del mensaje
                EMAIL_HOST_USER,             # Remitente
                [user.email],        # Destinatario(s)
                fail_silently=False,
            )
            login(request, user)
            
            return redirect('snap')
    else:
        form = UserForm()

    return render(request, 'register.html', {
        'form':form
    })


def snap(request):
    user=request.user
    if request.user.is_authenticated:
        if existing_content(user):
            return redirect('home')
    else:
        return redirect('index')

    quiz = get_quiz()    

    if request.method =='POST':
        form = ContentForm(request.POST, request.FILES)
        if form.is_valid():
            content = form.save(commit=False)
            content.user = user
            content.quiz_content = quiz
            try:
                ogimg = Image.open(content.pic)
                ogimg = correct_image_orientation(ogimg)

                ogwidth, ogheight = ogimg.size
                newsize = (int((ogwidth / ogheight) * 800), 800)
                img = ogimg.resize(newsize)



                img_io = io.BytesIO()
                img_format = 'PNG' if img.format == 'PNG' else 'JPEG'  # Determine format
                img.save(img_io, format=img_format)
                img_io.seek(0)  # Move the cursor to the beginning of the BytesIO object

                img_content = ContentFile(img_io.getvalue(), name=content.pic.name)
                content.pic.save(content.pic.name, img_content, save=False)  # Save the image to the model

                content.save()  # Finally save the content object
                return redirect('home')

            except ValueError as e:
                form.add_error('pic', 'Por favor, sube una imagen válida.')
            except Exception as e:
                form.add_error(None, 'Ocurrió un error al procesar la imagen. Intenta nuevamente.')
    else:
        form = ContentForm()

    return render(request, 'snap.html', {
        'quiz': quiz,
        'form': form,
    })


def home(request):

    #REDIRECT IF USER NOT LOGGED IN AND CHECK IF DAY'S THEME IS COMPLETED
    user=request.user
    if request.user.is_authenticated:
        if not existing_content(user):
            return redirect('snap')
    else:
        return redirect('index')
    
    quiz = get_quiz()
    favorites = get_favorites(user)

    #OBTAIN PIC AND USER
    content_items = Content.objects.filter(quiz_content=quiz).exclude(pic__isnull=True).select_related('user').order_by('-created_at').values('id','pic', 'user__name')

    #CREATE A LIST OF TUPLES WITH PICS AND USERS FOR THE DAY'S THEME
    pics = [(item['id'], f"{settings.MEDIA_URL}{item['pic']}", item['user__name']) for item in content_items]

    return render(request, 'home.html', {
        'pics': pics,
        'quiz': quiz,
        'favorites':favorites
    })

@login_required()
def toggle_favorites(request):
    if request.method == 'GET':
        image_id = request.GET.get('image_id')
        user=request.user

        try:
            content_instance=Content.objects.get(id=image_id)
            favorite, created = Favorites.objects.get_or_create(
                user=user,
                image = content_instance
            )
            if not created:
                favorite.delete()
                return JsonResponse({'status':'removed'})
            else:
                return JsonResponse({'status':'added'})
        except Content.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Content not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

def explore(request):
    #REDIRECT TO INDEX IF USER IS NOT LOGGED IN
    user = request.user
    if not user.is_authenticated:
        return redirect('index')
    
    #THEME LIST WHERE USER PARTICIPATED IN
    themes = completed_quizzes(user)
    
    content = Content.objects.filter(quiz_content__in=themes, pic__isnull=False).order_by('quiz_content', '-created_at').select_related('user').values('pic', 'quiz_content', 'user__name')

    grouped_pics = defaultdict(list) #Initialize dict where 'key':' empty list'
    theme_count = defaultdict(int) #Initialize dict where 'key':'0'

    for item in content:
        theme = item['quiz_content']
        if theme_count[theme] < 6:
            pic_url = f"{settings.MEDIA_URL}{item['pic']}"
            username = item['user__name']
            grouped_pics[theme].append((pic_url, username))
            theme_count[theme] += 1

    grouped_pics = {theme:tuple(pics) for theme, pics in grouped_pics.items()}

    return render(request, 'explore.html', {
        'pics':grouped_pics
    })


#POSSIBILITY OF INCLUDING 'USER' TO REUSE THE SAME VIEW IN EXPLORE/LIST
def load_more(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        count = int(request.GET.get('offset', 6))
        theme = request.GET.get('theme')
        images = Content.objects.filter(quiz_content=theme).order_by('-created_at').select_related('user').values('pic', 'user__name')[count:count +6]
        images_list = [{'pic_url': f"{settings.MEDIA_URL}{item['pic']}", 'user_name': item['user__name']} for item in images] #RENAME, IT IS NOT A LIST 
        return JsonResponse(images_list, safe=False)
    return JsonResponse({'error':'Invalid request'}, status=400)


@login_required()
def profile(request):
    return render(request, 'profile.html')

@login_required()
def notifications(request):
    return render(request, 'notifications.html')