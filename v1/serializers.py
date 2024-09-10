from rest_framework import serializers
from .models import User, Content

# Serializador para el modelo User
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'date_joined']

# Serializador para el modelo Content (para subir imágenes)
class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = ['id', 'user', 'pic', 'quiz_id', 'created_at']
