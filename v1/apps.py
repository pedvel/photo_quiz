from django.apps import AppConfig


class V1Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'v1'

    def ready(self):
        import v1.signals

        
