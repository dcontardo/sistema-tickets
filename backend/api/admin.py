# backend/api/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Ticket, Area, Escuela, Carrera

class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        ("Información personal", {"fields": ("first_name", "last_name")}),
        ("Permisos", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Datos adicionales", {"fields": ("tipo", "area", "escuela", "carrera")}),
    )
    list_display = ("username", "email", "tipo", "is_staff")

admin.site.register(User, UserAdmin)
admin.site.register(Ticket)
admin.site.register(Area)
admin.site.register(Escuela)
admin.site.register(Carrera)
