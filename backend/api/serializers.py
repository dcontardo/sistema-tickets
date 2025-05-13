from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Ticket, Comentario

UserModel = get_user_model()

# 👤 Serializador de Usuario
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['id', 'username', 'email', 'tipo', 'area', 'escuela']

# 🧾 Serializador de Ticket
class TicketSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = '__all__'

# 💬 Serializador de Comentario
class ComentarioSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(read_only=True)

    class Meta:
        model = Comentario
        # Listamos campos explícitamente para controlar bien los read-only:
        fields = ['id', 'contenido', 'ticket', 'usuario', 'creado_en']
        read_only_fields = ['id', 'ticket', 'usuario', 'creado_en']

# 🆕 Registro de usuario (para /auth/register/)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    # opcional: podrías añadir password2 aquí y validarlo en validate()

    class Meta:
        model = UserModel
        fields = ['id', 'username', 'email', 'password', 'tipo', 'area', 'escuela']

    def create(self, validated_data):
        user = UserModel.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            tipo=validated_data.get('tipo', 'estudiante'),
            area=validated_data.get('area'),
            escuela=validated_data.get('escuela')
        )
        return user

# 🔐 Login de usuario
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
