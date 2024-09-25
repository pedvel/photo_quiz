from attr import fields
from django import forms
from matplotlib import widgets
from .models import Content, User

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['email', 'name', 'password']
        widgets = {
            'email': forms.EmailInput(attrs={'placeholder': 'youremail@photoquiz.com'}),
            'name': forms.TextInput(attrs={'placeholder': 'Choose a username'}),
            'password': forms.PasswordInput(attrs={'placeholder': 'Choose a password'}),
        }

class ContentForm (forms.ModelForm):
    class Meta:
        model = Content
        fields = ['pic']
        