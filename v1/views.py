from django.conf import settings
from django.shortcuts import redirect, render
from .utils import get_quiz, existing_content, redirection_check, correct_image_orientation
from .forms import UserForm, ContentForm
from .models import User, Content
from django.contrib.auth.views import LoginView
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from django.contrib.auth import login, get_backends
from PIL import Image
from django.core.files.base import ContentFile
import io



# Create your views here.
class CustomLoginView(LoginView):
    template_name='login.html'
    
    def get(self, request, *args, **kwargs):
        
        #CHECK IF USER LOGGED-IN, AND IF 
        redirection = redirection_check(request)
        if redirection:
            return redirection
            
        return super().get(request, *args, **kwargs)
    
    #ESTA FUNCIONA, PERO SE PUEDE USAR REDIRECTION_CHECK, VER SI TIENE SENTIDO AQUÍ CHEQUEAR SI HAY USUARIO LOGUEADO AL SER LA SUCCES_URL
    def get_success_url(self):
        user = self.request.user
        #CHECK IF USER ALREADY COMPLETED DAY'S THEME
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
            login(request, user)
            return redirect('snap')
    else:
        form = UserForm()

    return render(request, 'register.html', {
        'form':form
    })



#SIGUENTE PASO ES CREAR EL MODEL Y SU RESPECTIVO FORM PARA ALMACENAR LAS FOTOS Y GUARDARLAS.
@login_required()
def snap(request):
    user = request.user
    quiz = get_quiz()
    if existing_content(user):
        return render(request, 'home.html')
    

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
        'existing_content': existing_content
    })

#@login_required()
def home(request):
    user = request.user
    if not user.is_authenticated:
        return redirect('index')
    quiz = get_quiz()
    pics = []

    # Obtener pic y name
    content_items = Content.objects.filter(quiz_content=quiz).exclude(pic__isnull=True).select_related('user').order_by('-created_at').values('pic', 'user__name')

    # Crear una lista de tuplas
    pics = [(f"{settings.MEDIA_URL}{item['pic']}", item['user__name']) for item in content_items]

    return render(request, 'home.html', {
        'pics': pics,
        'quiz': quiz
    })

@login_required()
def explore(request):
    return render(request, 'explore.html')

@login_required()
def profile(request):
    return render(request, 'profile.html')

@login_required()
def notifications(request):
    return render(request, 'notifications.html')