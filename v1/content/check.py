from django.shortcuts import redirect
from v1.content.themes import get_quiz
from v1.models import Content


def existing_content(user):
    check_completion = Content.objects.filter(user=user, quiz_content=get_quiz()).exists()
    return check_completion

def redirection_check(request):    #ONLY FOR VIEWS WHERE LOGIN ISN'T REQUIRED
    user = request.user
    if user.is_authenticated:
        if existing_content(user):
            return redirect('home')
        else:
            return redirect('snap')
    return None    