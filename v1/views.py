
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import redirect, render
from .utils import completed_quizzes, get_quiz, existing_content, redirection_check, get_favorites, save_image
from .forms import UserForm, ContentForm
from .models import Content, UserSettings, Favorites
from django.contrib.auth.views import LoginView
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from django.contrib.auth import login, get_backends
from collections import defaultdict
from django.core.mail import send_mail
from photo_quiz.settings import EMAIL_HOST_USER
from django.db.models import Count



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
                f'Welcome to Pixly, {user.name}!',               # Asunto del correo
                f'''Hi there,

Thank you for joining Pixly! We're thrilled to have you with us as we embark on this exciting journey. Your support means the world to us!

If you have any questions or feedback, please don't hesitate to reach out. We're here to help!

Cheers,
The Pixly Team
''',  # Cuerpo del mensaje
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
            saved, error = save_image(content, content.pic)
            if saved:
                return redirect('home')
            else:
                form.add_error('pic', error)            
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
    favorites = get_favorites(user) 
    
    content = Content.objects.filter(quiz_content__in=themes, pic__isnull=False).order_by( '-created_at','quiz_content').select_related('user').values('id','pic', 'quiz_content', 'user__name')

    grouped_pics = defaultdict(list) #Initialize dict where 'key':' empty list'
    theme_count = defaultdict(int) #Initialize dict where 'key':'0'

    for item in content:
        theme = item['quiz_content']
        if theme_count[theme] < 6:
            pic_url = f"{settings.MEDIA_URL}{item['pic']}"
            username = item['user__name']
            id=item['id']
            grouped_pics[theme].append((id, pic_url, username))
            theme_count[theme] += 1

    additional_pics = defaultdict(list)
    non_participated_count = defaultdict(int)

    if len(themes) < 5:
        themes_needed = 5 -len(themes)
        non_participated_themes = Content.objects.filter().exclude(quiz_content__in=themes).values('quiz_content').annotate(pic_count=Count('pic')).order_by('-pic_count')

        top_themes = [item['quiz_content'] for item in non_participated_themes[:themes_needed]]
        content_non_participated = Content.objects.filter(quiz_content__in=top_themes).order_by('-created_at', 'quiz_content').values('pic', 'quiz_content')

        for item in content_non_participated:
            theme = item['quiz_content']
            if non_participated_count[theme] < 3:
                pic_url = f'{settings.MEDIA_URL}{item['pic']}'
                additional_pics[theme].append(pic_url)
                non_participated_count[theme] += 1

    grouped_pics = {theme:tuple(pics) for theme, pics in grouped_pics.items()}
    additional_pics = {theme:tuple(pics) for theme, pics in additional_pics.items()}
    
    return render(request, 'explore.html', {
        'pics':grouped_pics,
        'favorites':favorites,
        'additional_pics': additional_pics
    })



def load_more(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        count = int(request.GET.get('offset', 6))
        theme = request.GET.get('theme')
        images = Content.objects.filter(quiz_content=theme).order_by('-created_at').select_related('user').values('id', 'pic', 'user__name')[count:count +6]
        images_list = [{'pic_url': f"{settings.MEDIA_URL}{item['pic']}", 'id':item['id'], 'user_name': item['user__name']} for item in images] #RENAME, IT IS NOT A LIST 
        return JsonResponse(images_list, safe=False)
    return JsonResponse({'error':'Invalid request'}, status=400)

def save_from_explore(request):
    if request.method == 'POST':
        user = request.user
        if not user.is_authenticated:
            return JsonResponse({'error':'Unauthorized'}, status=401)
        image_file = request.FILES.get('image')
        theme = request.POST.get('theme')
        if not image_file:
            return JsonResponse({'error':'No image provided'}, status=400)
        
        content = Content(user=user, quiz_content=theme)
        saved, error = save_image(content, image_file)
        if saved:
            return JsonResponse({'message':'Image succesfully saved'}, status=200)
        else:
            return JsonResponse({'error':error}, status=400)
    return JsonResponse({'error':'Invalid request'}, status=400)


@login_required()
def profile(request):
    return render(request, 'profile.html')

@login_required()
def notifications(request):
    return render(request, 'notifications.html')