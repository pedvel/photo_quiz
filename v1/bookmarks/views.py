from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render

from v1.bookmarks.data import BookmarkData
from v1.models import Content, Favorites



@login_required()
def toggle_favorites(request):
    if request.method == 'GET':
        image_id = request.GET.get('image_id')
        user=request.user

        try:
            content_instance=Content.objects.get(id=image_id)
            favorite, created = Favorites.objects.get_or_create(
                user=user,
                image = content_instance
            )
            if not created:
                favorite.delete()
                return JsonResponse({'status':'removed'})
            else:
                return JsonResponse({'status':'added'})
        except Content.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Content not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)



@login_required()
def saves(request):
    user = request.user
    user_data = BookmarkData(user)


    return render(request, 'saves.html',{
        'bkm_others':user_data.bkm_others,
        'bkm_self':user_data.bkm_self,
        'dict_bkm_others':user_data.favorites_count(),
        'photos':user_data.full_bkm_others
    })