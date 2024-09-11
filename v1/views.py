from django.conf import settings
from django.shortcuts import redirect, render
from .utils import completed_quizzes, get_quiz
from .forms import UserForm, ContentForm
from .models import User, Content
from django.contrib.auth.views import LoginView
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .serializers import ContentSerializer
from django.utils import timezone
from django.contrib.auth import login, get_backends
from PIL import Image


# Create your views here.

class CustomLoginView(LoginView):
    template_name='v1/login.html'
    #redirect_authenticated_user = True

    def get_success_url(self):
        user = self.request.user
        today = timezone.now().date()

        # Verifica si el usuario ya tiene contenido para el día actual
        existing_content = Content.objects.filter(user=user, created_at__date=today).exists()

        if existing_content:
            # Redirige a 'home' si ya hay contenido
            return reverse_lazy('home')
        else:
            # Redirige a 'dashboard' si no hay contenido
            return reverse_lazy('dashboard')

class ContentUploadView(generics.CreateAPIView):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Asignar el usuario autenticado al contenido
        serializer.save(user=self.request.user)


def index(request):
    quiz = get_quiz()   

    return render(request, 'v1/index.html', {
        'quiz':quiz
    })

def register(request):
    form = UserForm()

    if request.method == 'POST':
        form = UserForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()
            backend = get_backends()[0]  # Selecciona el primer backend// ESTO LO TENGO QUE REVER PORQUE DEJE UNO SOLO.
            user.backend = f'{backend.__module__}.{backend.__class__.__name__}'
            login(request, user)
            return redirect('dashboard')
        else:
            form = UserForm()

    return render(request, 'v1/register.html', {
        'form':form
    })



#SIGUENTE PASO ES CREAR EL MODEL Y SU RESPECTIVO FORM PARA ALMACENAR LAS FOTOS Y GUARDARLAS.
@login_required()
def dashboard(request):
    user = request.user
    quiz = get_quiz()
    today = timezone.now().date()
    existing_content = Content.objects.filter(user=user, quiz_content = quiz).first()

    if existing_content:
        return render(request, 'v1/home.html')
    

    if request.method =='POST':
        form = ContentForm(request.POST, request.FILES)
        if form.is_valid():
            content = form.save(commit=False)
            content.user = user
            content.quiz_content = quiz
            try:
                img = Image.open(content.pic) 
                max_size = (200, 200)
                img.thumbnail(max_size, Image.LANCZOS)
                img.save(content.pic.path) 
                content.save()
                return redirect('home')
            except ValueError as e:
                form.add_error('pic', 'Por favor, sube una imagen válida.')
            except Exception as e:
                form.add_error(None, 'Ocurrió un error al procesar la imagen. Intenta nuevamente.')
    
    else:
        form = ContentForm()


    return render(request, 'v1/dashboard.html', {
        'quiz':quiz,
        'form':form,
        'existing_content':existing_content
    })

@login_required()
def home(request):

    user = request.user
    #COMPLETED QUIZZES LIST FOR USER
    quizzes = completed_quizzes(user)
    pics = []

    for quiz in quizzes:     
        images = Content.objects.filter(quiz_content=quiz).exclude(pic__isnull=True).values_list('pic', flat=True)
        pics.extend([f"{settings.MEDIA_URL}{pic}" for pic in images])
   
    return render(request, 'v1/home.html', {
        'pics':pics
    })
