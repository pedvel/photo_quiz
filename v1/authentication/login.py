from django.urls import reverse_lazy
from v1.content.check import redirection_check, existing_content
from django.contrib.auth.views import LoginView


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