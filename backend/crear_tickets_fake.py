import os
import django
import random
from faker import Faker

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Ticket, User

fake = Faker()
estados = ["Abierto", "En Revisión", "Resuelto"]
prioridades = ["Alta", "Media", "Baja"]

# ⚠️ Asegúrate que exista este usuario
usuario = User.objects.get(username="root")

for _ in range(500):
    Ticket.objects.create(
        titulo=fake.sentence(),
        descripcion=fake.paragraph(),
        prioridad=random.choice(prioridades),
        estado=random.choice(estados),
        usuario=usuario  # 👈 asigna el usuario correctamente
    )

print("✅ Tickets creados.")
