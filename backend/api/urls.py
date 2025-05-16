from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TicketViewSet,
    ComentarioListCreateView,
    RegisterView,
    LoginView,
    yo,
    tickets_por_estado,
    tickets_por_prioridad,
    tickets_por_area,
    AreaListView,
    EscuelaListView,
    CarreraListView,
    listar_usuarios,
    eliminar_usuario,
    actualizar_usuario,  # ✅ se agrega aquí
)

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='tickets')

urlpatterns = [
    path('', include(router.urls)),

    # Comentarios
    path('tickets/<int:ticket_id>/comentarios/', ComentarioListCreateView.as_view(), name='comentarios'),

    # Autenticación
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/yo/', yo, name='yo'),

    # Métricas
    path('metricas/tickets-por-estado/', tickets_por_estado, name='tickets_por_estado'),
    path('metricas/tickets-por-prioridad/', tickets_por_prioridad, name='tickets_por_prioridad'),
    path('metricas/tickets-por-area/', tickets_por_area, name='tickets_por_area'),

    # Catálogos
    path('areas/', AreaListView.as_view(), name='areas'),
    path('escuelas/', EscuelaListView.as_view(), name='escuelas'),
    path('carreras/', CarreraListView.as_view(), name='carreras'),

    # Usuarios
    path('usuarios/', listar_usuarios, name='usuarios'),
    path('usuarios/<int:user_id>/eliminar/', eliminar_usuario, name='eliminar_usuario'),
    path('usuarios/<int:user_id>/actualizar/', actualizar_usuario, name='actualizar_usuario'),  # ✅ ESTA LÍNEA ES CLAVE
]
