from typing import Required
from django.conf import settings
from django.shortcuts import redirect, render
from httpx import get
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
from PIL import Image, ImageOps
from django.core.files.base import ContentFile
import io



# Create your views here.

class CustomLoginView(LoginView):
    template_name='login.html'
    
    def get(self, request, *args, **kwargs):
        # Verifica si el usuario ya está autenticado
        if request.user.is_authenticated:
            # Redirige a 'home' si el usuario está autenticado
            return redirect('home')  # Cambia 'home' por la URL a la que quieras redirigir

        return super().get(request, *args, **kwargs)

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
            return reverse_lazy('snap')

class ContentUploadView(generics.CreateAPIView):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Asignar el usuario autenticado al contenido
        serializer.save(user=self.request.user)


def index(request):
    return render(request, 'index.html')

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
    existing_content = Content.objects.filter(user=user, quiz_content = quiz).first()

    if existing_content:
        return render(request, 'home.html')
    

    if request.method =='POST':
        form = ContentForm(request.POST, request.FILES)
        if form.is_valid():
            content = form.save(commit=False)
            content.user = user
            content.quiz_content = quiz
            try:
                img = Image.open(content.pic)
                
                max_size = (500, 500)
                img.thumbnail(max_size, Image.LANCZOS)

                img_io = io.BytesIO()
                img.save(img_io, format=img.format)  # Mantiene el formato original (PNG, JPEG, etc.)
                img_content = ContentFile(img_io.getvalue(), name=content.pic.name)

                # Sobrescribe el archivo original
                content.pic.save(content.pic.name, img_content, save=False)

                content.save()
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

@login_required()
def home(request):

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