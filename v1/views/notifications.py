
from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required()
def notifications(request):
    return render(request, 'notifications.html')