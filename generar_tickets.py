# generar_tickets.py

import os
import sys
import django
import random
from faker import Faker

# 1) Prepara entorno Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# 2) Importa modelos
from api.models import Ticket, User

fake = Faker()

def generar_tickets(n_tickets=50):
    """
    Genera n_tickets de prueba asignados aleatoriamente
    a usuarios de tipo 'estudiante'.
    """
    estudiantes = list(User.objects.filter(tipo='estudiante'))
    if not estudiantes:
        print("⚠️  No hay usuarios de tipo 'estudiante' registrados.")
        return

    for _ in range(n_tickets):
        Ticket.objects.create(
            titulo      = fake.sentence(nb_words=6),
            descripcion = fake.paragraph(nb_sentences=4),
            estado      = random.choice(['abierto', 'en_revision', 'resuelto']),
            prioridad   = random.choice(['alta', 'media', 'baja']),
            usuario     = random.choice(estudiantes)
        )
    print(f"✔️  Se generaron {n_tickets} tickets de prueba.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Genera tickets de prueba en el sistema.")
    parser.add_argument(
        "-n", "--numero",
        type=int,
        default=50,
        help="Cantidad de tickets a generar (por defecto: 50)"
    )

    args = parser.parse_args()
    generar_tickets(args.numero)
