import csv
from datetime import datetime, timezone
from v1.models import Content


def get_quiz():
    #DAY NUMBER SINCE NEWYEAR.
    today = datetime.now(timezone.utc).timetuple().tm_yday

    #OPEN AND READ QUIZ_DICT
    with open('./docs/quiz_list.csv', 'r') as file:
        reader = csv.DictReader(file, delimiter=';')
        rows = list(reader)  # Convert to a list

        return rows[today-1]['quiz']
    
def completed_quizzes(user):
    quizzes = Content.objects.filter(user=user).values_list('quiz_content', flat=True)
    return quizzes