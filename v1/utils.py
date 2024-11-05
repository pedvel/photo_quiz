from datetime import timezone, datetime
import csv
from typing import Counter
from django.shortcuts import redirect
from .models import Content, Favorites
from PIL import ExifTags, Image
import pillow_avif
import re
import io
from django.core.files.base import ContentFile
from django.conf import settings


def get_quiz():
    #DAY NUMBER SINCE NEWYEAR.
    today = datetime.now(timezone.utc).timetuple().tm_yday

    #OPEN AND READ QUIZ_DICT
    with open('./docs/quiz_list.csv', 'r') as file:
        reader = csv.DictReader(file, delimiter=';')
        rows = list(reader)  # Convert to a list

        return rows[today-1]['quiz']


def correct_image_orientation(img):
    try:
        # Get Exif orientation data
        for orientation in ExifTags.TAGS.keys():
            if ExifTags.TAGS[orientation] == 'Orientation':
                break
        exif = img._getexif()
        if exif is not None and orientation in exif:
            orientation_value = exif[orientation]
            if orientation_value == 3:  # 180 degrees
                img = img.rotate(180, expand=True)
            elif orientation_value == 6:  # 90 degrees clockwise
                img = img.rotate(270, expand=True)
            elif orientation_value == 8:  # 90 degrees counter-clockwise
                img = img.rotate(90, expand=True)
    except Exception as e:
        print(f"Error correcting image orientation: {e}")
    return img

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

def completed_quizzes(user):
    quizzes = Content.objects.filter(user=user).values_list('quiz_content', flat=True)
    return quizzes
    
            
def email_check(email):
    regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if re.match(regex, email):
        return True
    else:
        return False
   

def save_image(content, image_field):
    try:
        # Open the original image
        ogimg = Image.open(image_field)
        ogimg = correct_image_orientation(ogimg)
        
        # Create a new image without EXIF data
        clean_img = Image.new(ogimg.mode, ogimg.size)
        clean_img.paste(ogimg)
        
        # Resize the image
        ogwidth, ogheight = clean_img.size
        newsize = (450, int((ogheight / ogwidth) * 450))
        img = clean_img.resize(newsize)
        
        # Save the image as AVIF in a BytesIO buffer
        img_io = io.BytesIO()
        img.save(img_io, format='AVIF', quality=50, reduction=2)  # AVIF-specific options
        img_io.seek(0)
        
        # Prepare the file for saving with .avif extension
        img_content = ContentFile(img_io.getvalue(), name=image_field.name.rsplit('.', 1)[0] + '.avif')
        
        # Delete any existing pic field to avoid cached formats
        if content.pic:
            content.pic.delete(save=False)
        
        # Save the image to the content model with .avif extension
        content.pic.save(img_content.name, img_content, save=False)
        
        # Save the content model instance
        content.save()
        return True, None

    except ValueError:
        return False, 'Invalid image format'
    except Exception as e:
        return False, f'Error processing the image: {str(e)}'


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