from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TicketViewSet,
    ComentarioListCreateView,
    RegisterView,
    LoginView,
    yo,
    tickets_por_estado ,
    tickets_por_prioridad,
    tickets_por_area,
)

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='tickets')

urlpatterns = [
    path('', include(router.urls)),
    path('tickets/<int:ticket_id>/comentarios/', ComentarioListCreateView.as_view(), name='comentarios'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/yo/', yo, name='yo'),
    path('metricas/tickets-por-estado/', tickets_por_estado, name='tickets_por_estado'),
    path('metricas/tickets-por-prioridad/', tickets_por_prioridad, name='tickets_por_prioridad'),
    path('metricas/tickets-por-area/', tickets_por_area, name='tickets_por_area'),
]
