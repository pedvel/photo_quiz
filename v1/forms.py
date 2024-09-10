from attr import fields
from django import forms
from matplotlib import widgets
from .models import Content, User

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['email', 'name', 'password']  # Los campos que quieres incluir en el formulario
        widgets = {
            'password': forms.PasswordInput(),  # Esto hará que el campo de contraseña oculte el texto
        }

class ContentForm (forms.ModelForm):
    class Meta:
        model = Content
        fields = ['pic']
        