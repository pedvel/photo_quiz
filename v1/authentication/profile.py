from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from v1.content.check import get_quiz, existing_content
from v1.bookmarks.data import BookmarkData




@login_required()
def profile(request):
    user = request.user
    user_data = BookmarkData(user)
    theme = get_quiz()
    today_participation = existing_content(user)
    

    return render(request, 'profile.html', {
        'bkm_self': user_data.bkm_self,
        'username': user.name,
        'theme':theme,
        'photos':user_data.photos,
        'total_bkm': user_data.total_bkm,
        'today_participation': today_participation
    })
