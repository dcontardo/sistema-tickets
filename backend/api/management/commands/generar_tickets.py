from api.models import Ticket, User
from faker import Faker
import random

faker = Faker()
user = User.objects.get(username='root')  # Puedes cambiar por otro usuario si quieres

estados = ['Abierto', 'En Revisión', 'Resuelto']
prioridades = ['Alta', 'Media', 'Baja']

for _ in range(100):
    Ticket.objects.create(
        titulo=faker.sentence(nb_words=5),
        descripcion=faker.paragraph(nb_sentences=3),
        estado=random.choice(estados),
        prioridad=random.choice(prioridades),
        usuario=user
    )

print("✅ 100 tickets creados exitosamente.")
