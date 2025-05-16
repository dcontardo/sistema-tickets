from django.contrib import admin
from .models import Ticket  # Importa el modelo Ticket

admin.site.register(Ticket)  # Registra el modelo en el admin
