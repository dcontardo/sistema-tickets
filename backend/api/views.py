from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate
from django.db.models import Count, F
from .models import Ticket, Comentario, User, Area, Escuela, Carrera
from .serializers import (
    TicketSerializer,
    ComentarioSerializer,
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    AreaSerializer,
    EscuelaSerializer,
    CarreraSerializer,
)

# -------------------- Tickets --------------------
class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Ticket.objects.all().order_by('-creado_en')
        if user.tipo == "admin":
            return qs
        if user.tipo == "funcionario":
            return qs.filter(usuario__area=user.area)
        return qs.filter(usuario=user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        # DEBUG: muestra lo que llega y los errores
        print("📥 PATCH recibido:", request.data)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if not serializer.is_valid():
            print("❌ Errores de validación:", serializer.errors)
            return Response(serializer.errors, status=400)

        self.perform_update(serializer)
        return Response(serializer.data)

# -------------------- Comentarios --------------------
class ComentarioListCreateView(generics.ListCreateAPIView):
    serializer_class = ComentarioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ticket_id = self.kwargs['ticket_id']
        return Comentario.objects.filter(ticket_id=ticket_id).order_by('creado_en')

    def perform_create(self, serializer):
        serializer.save(ticket_id=self.kwargs['ticket_id'], usuario=self.request.user)

# -------------------- Registro --------------------
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

# -------------------- Login --------------------
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

# -------------------- Usuario autenticado --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def yo(request):
    return Response(UserSerializer(request.user).data)

# -------------------- Métricas --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tickets_por_estado(request):
    data = Ticket.objects.values('estado').annotate(total=Count('id')).order_by('-total')
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tickets_por_prioridad(request):
    data = Ticket.objects.values('prioridad').annotate(total=Count('id')).order_by('-total')
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tickets_por_area(request):
    data = Ticket.objects.annotate(area=F('usuario__area')).values('area').annotate(total=Count('id')).order_by('-total')
    return Response(data)

# -------------------- Usuarios --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_usuarios(request):
    usuarios = User.objects.all()
    data = []
    for u in usuarios:
        data.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "tipo": u.tipo,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "nombre_completo": f"{u.first_name} {u.last_name}".strip() if u.first_name or u.last_name else "—",
            "area": u.area.id if u.area else None,
            "area_nombre": u.area.nombre if u.area else "—",
            "escuela": u.escuela.id if u.escuela else None,
            "escuela_nombre": u.escuela.nombre if u.escuela else "—",
            "carrera": u.carrera.id if hasattr(u, 'carrera') and u.carrera else None,
            "carrera_nombre": u.carrera.nombre if hasattr(u, 'carrera') and u.carrera else "—",
        })
    return Response(data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def actualizar_usuario(request, user_id):
    if request.user.tipo != 'admin':
        return Response({"detail": "No autorizado"}, status=403)
    try:
        user = User.objects.get(id=user_id)
        data = request.data
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.tipo = data.get('tipo', user.tipo)
        user.area_id = data.get('area')
        user.escuela_id = data.get('escuela')
        user.carrera_id = data.get('carrera')
        user.save()
        return Response({"detail": "Usuario actualizado correctamente"})
    except User.DoesNotExist:
        return Response({"detail": "Usuario no encontrado"}, status=404)
    except Exception as e:
        return Response({"detail": str(e)}, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_usuario(request, user_id):
    try:
        if request.user.tipo != 'admin':
            return Response({"detail": "No autorizado"}, status=403)

        user = User.objects.get(id=user_id)

        if user.username == "root":
            return Response({"detail": "No se puede eliminar el usuario root"}, status=403)

        user.delete()
        return Response({"detail": "Usuario eliminado correctamente"}, status=204)
    except User.DoesNotExist:
        return Response({"detail": "Usuario no encontrado"}, status=404)

# -------------------- Catálogos --------------------
from rest_framework.generics import ListAPIView

class AreaListView(ListAPIView):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer

class EscuelaListView(ListAPIView):
    queryset = Escuela.objects.all()
    serializer_class = EscuelaSerializer

class CarreraListView(ListAPIView):
    queryset = Carrera.objects.all()
    serializer_class = CarreraSerializer

class UserListView(ListAPIView):
    queryset = User.objects.all().order_by("username")
    serializer_class = UserSerializer
