
from datetime import timezone, datetime
import csv
from multiprocessing import Value
from .models import User, Content


def get_quiz():
    #DAY NUMBER SINCE NEWYEAR.
    today = datetime.now(timezone.utc).timetuple().tm_yday

    #OPEN AND READ QUIZ_DICT
    try:
        with open('./docs/quiz_list.csv', 'r') as file:
            reader = csv.DictReader(file, delimiter=';')
            for row in reader:
                if int(row['day']) == today:
                    return row['quiz']
    except FileNotFoundError:
        print("File not found")

def completed_quizzes(user):
    quizzes = Content.objects.filter(user=user).values_list('quiz_content', flat=True)
    return quizzes
    
            
    

