from collections import Counter

from django.conf import settings

from v1.models import Content, Favorites


class BookmarkData:
    def __init__(self, user):
        self.user=user
        self.photos = self._get_photos()
        self.bkm_self=self._get_favorites()
        self.bkm_others=self._get_bookmark_others()
        self.total_bkm=len(self.bkm_others)
        self.full_bkm_others=self._bkm_full_data()

    def _get_photos(self):
        photos = Content.objects.filter(user=self.user).order_by('-created_at').values('pic', 'quiz_content', 'id')        
        for item in photos:
            item['pic'] = f"{settings.MEDIA_URL}{item['pic']}"
        return photos
    
    def _get_favorites(self):        
        favorites = Favorites.objects.filter(user=self.user).order_by('-id').values_list('image_id', flat=True)
        return list(favorites)
    
    def _get_bookmark_others(self):
        bkm_others= Favorites.objects.filter(image__in=(photo['id'] for photo in self.photos)).select_related('content').values_list('image_id', flat=True)
        return bkm_others
    
    def _bkm_full_data(self):
        full_bkm_others=Content.objects.filter(id__in=self.bkm_others).order_by('-created_at').values( 'pic', 'quiz_content', 'id')
        for item in full_bkm_others:
            item['pic'] = f"{settings.MEDIA_URL}{item['pic']}"
        return full_bkm_others
    
    def favorites_count(self):
        return dict(Counter(self.bkm_others))
    
    def total_bookmars(self):
        return self.total_bkm