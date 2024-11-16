from django import forms
from .models import Content, User
from v1.utils.email_check import email_check


class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['email', 'name', 'password']
        widgets = {
            'email': forms.EmailInput(attrs={'placeholder': 'youremail@photoquiz.com'}),
            'name': forms.TextInput(attrs={'placeholder': 'Choose a username'}),
            'password': forms.PasswordInput(attrs={'placeholder': 'Choose a password'}),
        }

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email_check(email):
            if User.objects.filter(email=email).exists():
                return forms.ValidationError('email is already registered')
            else:
                return email
        else:
            return forms.ValidationError('Please, enter a valid email adress')
        
    def clean_name(self):
        name = self.cleaned_data.get('name')
        if User.objects.filter(name=name).exists():
            raise forms.ValidationError('username is already taken')
        return name

    def clean(self):
        cleaned_data=super().clean()
        email = cleaned_data.get('email')
        name = cleaned_data.get('name')
        return cleaned_data
    
    def __init__(self, *args, **kwargs):
        super(UserForm, self).__init__(*args, **kwargs)


class ContentForm (forms.ModelForm):
    class Meta:
        model = Content
        fields = ['pic']

    def save(self, commit=True):
        instance = super().save(commit=False)
        if instance.pic and 'avif' not in instance.pic.name:
            instance.pic.name = instance.pic.name.rsplit('.', 1)[0] + '.avif'
        if commit:
            instance.save()
        return instance
        