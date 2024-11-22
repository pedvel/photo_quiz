from collections import defaultdict
import json
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.contrib.auth.decorators import login_required
from django.db.models import Count

from v1.bookmarks.data import BookmarkData
from v1.content.check import existing_content
from v1.content.themes import completed_quizzes, get_quiz
from v1.forms import ContentForm
from v1.image_processing.save_img import save_image
from v1.models import Content, Favorites


@login_required
def upload(request):
    if request.method == 'POST':
        user = request.user
        form = ContentForm(request.POST, request.FILES)
        if form.is_valid:
            content = form.save(commit=False)
            content.user = user
            theme = request.POST.get('theme')
            content.quiz_content = theme
            saved, error = save_image(content, content.pic)
            if saved:
                return JsonResponse({'message':'Image succesfully saved'}, status=200)
            else:
                return JsonResponse({'error':error}, status=400) 
        
    return JsonResponse({'error':'Invalid request'}, status=400)


@login_required
def snap(request):
    user=request.user
    if existing_content(user):
        return redirect('home')

    quiz = get_quiz()       

    return render(request, 'snap.html', {
        'quiz': quiz,
    })

@login_required
def home(request):
    user=request.user
    
    if not existing_content(user):
        return redirect('snap')
    
    quiz = get_quiz()
    user_data = BookmarkData(user)
    favorites = user_data.bkm_self

    #OBTAIN PIC AND USER
    content_items = Content.objects.filter(quiz_content=quiz).exclude(pic__isnull=True).select_related('user').order_by('-created_at').values('id','pic', 'user__name')

    #CREATE A LIST OF TUPLES WITH PICS AND USERS FOR THE DAY'S THEME
    pics = [(item['id'], f"{settings.MEDIA_URL}{item['pic']}", item['user__name']) for item in content_items]

    return render(request, 'home.html', {
        'pics': pics,
        'quiz': quiz,
        'favorites':favorites
    })

@login_required
def explore(request):
    user = request.user
    
    #THEME LIST WHERE USER PARTICIPATED IN
    themes = completed_quizzes(user)
    user_data = BookmarkData(user)
    favorites = user_data.bkm_self 

    non_participated_themes = Content.objects.filter().exclude(quiz_content__in=themes).values('quiz_content').annotate(pic_count=Count('pic')).order_by('-pic_count')
    non_participated_list=[]
    for item in non_participated_themes:
        theme = item['quiz_content']
        non_participated_list.append(theme)
    
    return render(request, 'explore.html', {
        'favorites':favorites,
        'non_participated_list':non_participated_list,
        'completed_themes':json.dumps(list(themes))
    })

@login_required
def explore_theme(request, theme):
    user=request.user
    user_data=BookmarkData(user)
    bkm_self=user_data.bkm_self

    images = Content.objects.filter(quiz_content=theme).order_by('-created_at').select_related('user').values('id', 'pic', 'user__name')[:6]

    images_list = [{'pic_url': f"{settings.MEDIA_URL}{item['pic']}", 'id':item['id'], 'user_name': item['user__name']} for item in images] 

    return render(request, 'theme.html', {
        'theme':theme,
        'images_list':images_list,
        'bkm_self':bkm_self
    })

@login_required
def explore_more(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        offset = int(request.GET.get('offset', 0))
        completed_themes = json.loads(request.GET.get('completed_themes', '[]'))

        content = Content.objects.order_by( '-created_at','quiz_content').select_related('user').values('id','pic', 'quiz_content', 'user__name')

        grouped_pics = defaultdict(list)
        theme_count = defaultdict(int)
        unique_themes = []
        max_themes = 8

        for item in content:
            theme = item['quiz_content']
            if theme not in grouped_pics:
                unique_themes.append(theme)

            max_pics = 6 if theme in completed_themes else 3

            if theme_count[theme] < max_pics:
                    pic_url = f"{settings.MEDIA_URL}{item['pic']}"
                    username = item['user__name']
                    id=item['id']

                    grouped_pics[theme].append((id, pic_url, username))
                    theme_count[theme] += 1
           
        selected_themes = unique_themes[offset:offset+max_themes]
        result_pics = {theme:tuple(grouped_pics[theme]) for theme in selected_themes}

        return JsonResponse({'pics': result_pics}, safe=False)
    return JsonResponse({'error':'Invalid request'}, status=400)


@login_required()
def load_more(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        offset = int(request.GET.get('offset', 6))
        theme = request.GET.get('theme')
        images = Content.objects.filter(quiz_content=theme).order_by('-created_at').select_related('user').values('id', 'pic', 'user__name')[offset:offset +6]
        images_list = [{'pic_url': f"{settings.MEDIA_URL}{item['pic']}", 'id':item['id'], 'user_name': item['user__name']} for item in images] 
        return JsonResponse(images_list, safe=False)
    return JsonResponse({'error':'Invalid request'}, status=400)