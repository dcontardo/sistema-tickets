# backend/api/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Ticket, Comentario, Area, Escuela, Carrera

User = get_user_model()

# -------------------- REGISTRO --------------------
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password',
            'first_name', 'last_name',
            'tipo', 'area', 'escuela', 'carrera',
        )
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Este nombre de usuario ya está en uso."})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Este correo ya está registrado."})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

# -------------------- LOGIN --------------------
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

# -------------------- USUARIO --------------------
class UserSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()
    area_nombre = serializers.CharField(source='area.nombre', read_only=True)
    escuela_nombre = serializers.CharField(source='escuela.nombre', read_only=True)
    carrera_nombre = serializers.CharField(source='carrera.nombre', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'tipo',
            'first_name', 'last_name', 'nombre_completo',
            'area', 'escuela', 'carrera',
            'area_nombre', 'escuela_nombre', 'carrera_nombre',
        ]

    def get_nombre_completo(self, obj):
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return "—"

# -------------------- ÁREAS, ESCUELAS, CARRERAS --------------------
class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ['id', 'nombre']

class EscuelaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Escuela
        fields = ['id', 'nombre']

class CarreraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrera
        fields = ['id', 'nombre', 'escuela']

# -------------------- COMENTARIOS --------------------
class ComentarioSerializer(serializers.ModelSerializer):
    usuario_username = serializers.ReadOnlyField(source='usuario.username')

    class Meta:
        model = Comentario
        fields = ['id', 'ticket', 'usuario', 'usuario_username', 'contenido', 'creado_en']

# -------------------- TICKETS --------------------
class TicketSerializer(serializers.ModelSerializer):
    usuario_username = serializers.ReadOnlyField(source='usuario.username')
    usuario_nombre = serializers.ReadOnlyField(source='usuario.first_name')
    usuario_apellido = serializers.ReadOnlyField(source='usuario.last_name')
    usuario_email = serializers.ReadOnlyField(source='usuario.email')
    area_nombre = serializers.CharField(source='usuario.area.nombre', read_only=True)
    escuela_nombre = serializers.CharField(source='usuario.escuela.nombre', read_only=True)
    carrera_nombre = serializers.CharField(source='usuario.carrera.nombre', read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id',
            'titulo',
            'descripcion',
            'estado',
            'prioridad',
            'usuario',
            'usuario_username',
            'usuario_nombre',
            'usuario_apellido',
            'usuario_email',
            'area_nombre',
            'escuela_nombre',
            'carrera_nombre',
            'creado_en',
        ]
