from django.db import models
from django.contrib.auth.models import AbstractUser

# Nuevas clases
class Area(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

class Escuela(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

TIPOS_USUARIO = [
    ('estudiante', 'Estudiante'),
    ('funcionario', 'Funcionario'),
    ('admin', 'Administrador'),
]

class User(AbstractUser):
    tipo = models.CharField(max_length=20, choices=TIPOS_USUARIO, default='estudiante')
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True, blank=True)
    escuela = models.ForeignKey(Escuela, on_delete=models.SET_NULL, null=True, blank=True)
    carrera = models.ForeignKey('Carrera', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.tipo})"

class Ticket(models.Model):
    PRIORITY_CHOICES = [
        ('Alta', 'Alta'),
        ('Media', 'Media'),
        ('Baja', 'Baja'),
    ]

    ESTADO_CHOICES = [
        ('Abierto', 'Abierto'),
        ('En Revisión', 'En Revisión'),
        ('Resuelto', 'Resuelto'),
    ]

    titulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    prioridad = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Media')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='Abierto')
    creado_en = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')

    def __str__(self):
        return self.titulo

class Comentario(models.Model):
    ticket = models.ForeignKey(Ticket, related_name='comentarios', on_delete=models.CASCADE)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comentarios')
    contenido = models.TextField()
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentario #{self.id} para Ticket #{self.ticket.id}"

class Carrera(models.Model):
    nombre = models.CharField(max_length=100)
    escuela = models.ForeignKey(Escuela, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.nombre} ({self.escuela.nombre})"
