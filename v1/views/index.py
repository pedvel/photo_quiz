
from django.shortcuts import render
from v1.content.check import redirection_check


def index(request):
    redirection = redirection_check(request)
    if redirection:
        return redirection

    return render(request, 'index.html')