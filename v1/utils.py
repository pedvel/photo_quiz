from datetime import timezone, datetime
import csv
from django.shortcuts import redirect
from .models import Content, Favorites
from PIL import ExifTags
import re

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


def get_favorites(user):
    favorites = Favorites.objects.filter(user=user).order_by('-id').values_list('image_id', flat=True)
    return list(favorites)
   

