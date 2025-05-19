# cargar_datos.py

import os
import sys
import django

# 1) Asegúrate de que Django encuentre tu settings.py:
#    añade al PYTHONPATH el directorio 'backend', donde está settings.py.
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

django.setup()

from api.models import User, Area, Escuela, Carrera, Ticket
from django.contrib.auth.hashers import make_password
from faker import Faker
import random

fake = Faker()

# 2) Crear áreas si no existen
areas = ['Admisión', 'Registro Académico', 'Financiamiento']
for nombre in areas:
    Area.objects.get_or_create(nombre=nombre)

# 3) Crear escuelas si no existen
escuelas = ['Salud', 'Informática', 'Negocios', 'Industrial']
for nombre in escuelas:
    Escuela.objects.get_or_create(nombre=nombre)

# 4) Crear carreras asociadas a cada escuela
carreras_por_escuela = {
    'Salud': ['Enfermería', 'Kinesiología'],
    'Informática': ['Ingeniería en Informática', 'Técnico en Programación'],
    'Negocios': ['Contabilidad', 'Administración de Empresas'],
    'Industrial': ['Ingeniería Industrial', 'Logística']
}
for escu, lista in carreras_por_escuela.items():
    escuela = Escuela.objects.get(nombre=escu)
    for carr in lista:
        Carrera.objects.get_or_create(nombre=carr, escuela=escuela)

# 5) Crear usuario admin
User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@ips.cl',
        'first_name': 'Admin',
        'last_name': 'Sistema',
        'password': make_password('admin123'),
        'tipo': 'admin',
    }
)

# 6) Crear funcionarios (tipo 'funcionario')
for i in range(1, 4):
    User.objects.get_or_create(
        username=f'funcionario{i}',
        defaults={
            'email': f'func{i}@ips.cl',
            'first_name': fake.first_name(),
            'last_name': fake.last_name(),
            'password': make_password('func123'),
            'tipo': 'funcionario',
            'area': Area.objects.order_by('?').first(),
        }
    )

# 7) Crear estudiantes (tipo 'estudiante')
for i in range(1, 11):
    escuela = Escuela.objects.order_by('?').first()
    carrera = Carrera.objects.filter(escuela=escuela).order_by('?').first()
    User.objects.get_or_create(
        username=f'estudiante{i}',
        defaults={
            'email': f'estudiante{i}@ips.cl',
            'first_name': fake.first_name(),
            'last_name': fake.last_name(),
            'password': make_password('est123'),
            'tipo': 'estudiante',
            'escuela': escuela,
            'carrera': carrera,
        }
    )

# 8) Crear tickets de prueba asociados a cada estudiante
estudiantes = User.objects.filter(tipo='estudiante')
for _ in range(20):
    u = random.choice(list(estudiantes))
    Ticket.objects.create(
        titulo=fake.sentence(nb_words=5),
        descripcion=fake.paragraph(nb_sentences=3),
        estado=random.choice(['abierto', 'en_revision', 'resuelto']),
        prioridad=random.choice(['alta', 'media', 'baja']),
        usuario=u  # campo correcto en tu modelo
    )

print("Usuarios y tickets creados con éxito.")
