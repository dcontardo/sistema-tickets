# api/views.py
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate
from django.db.models import Count
from .models import Ticket, Comentario, User
from .serializers import (
    TicketSerializer,
    ComentarioSerializer,
    RegisterSerializer,
    LoginSerializer,
    UserSerializer
)

# Vista de Tickets con perfilamiento
class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.tipo == "admin":
            return Ticket.objects.all().order_by('-creado_en')
        elif user.tipo == "funcionario":
            return Ticket.objects.filter(usuario__area=user.area).order_by('-creado_en')
        else:  # estudiante
            return Ticket.objects.filter(usuario=user).order_by('-creado_en')

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

# Comentarios
class ComentarioListCreateView(generics.ListCreateAPIView):
    serializer_class = ComentarioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ticket_id = self.kwargs['ticket_id']
        return Comentario.objects.filter(ticket_id=ticket_id).order_by('creado_en')

    def perform_create(self, serializer):
        ticket_id = self.kwargs['ticket_id']
        serializer.save(ticket_id=ticket_id, usuario=self.request.user)

# Registro
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "user": UserSerializer(user).data,
            "token": token.key
        }, status=status.HTTP_201_CREATED)

# Login
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        if not user:
            return Response({"error": "Credenciales inválidas"}, status=400)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "user": UserSerializer(user).data,
            "token": token.key
        })

# Validar token /auth/yo
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def yo(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# Métricas
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tickets_por_estado(request):
    data = Ticket.objects.values('estado').annotate(total=Count('id'))
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tickets_por_prioridad(request):
    data = Ticket.objects.values('prioridad').annotate(total=Count('id')).order_by('-total')
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tickets_por_area(request):
    data = Ticket.objects.values('usuario__area').annotate(total=Count('id')).order_by('-total')
    return Response(data)
