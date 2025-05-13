from rest_framework.test import APITestCase
from django.urls import reverse
from .models import User, Ticket

class AuthTests(APITestCase):
    def test_register_and_login(self):
        # Registro
        url = reverse('register')
        data = {'username': 'u1', 'password': 'p123', 'password2': 'p123'}
        res = self.client.post(url, data)
        self.assertEqual(res.status_code, 201)
        self.assertIn('token', res.data)

        # Login
        url = reverse('login')
        res2 = self.client.post(url, {'username': 'u1', 'password': 'p123'})
        self.assertEqual(res2.status_code, 200)
        self.assertIn('token', res2.data)

class TicketTests(APITestCase):
    def setUp(self):
        # Creamos usuario y nos autenticamos
        self.user = User.objects.create_user(username='u2', email='u2@example.com', password='pass')
        login_res = self.client.post(reverse('login'),
                                     {'username': 'u2', 'password': 'pass'})
        self.token = login_res.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token}')

    def test_create_and_list_ticket(self):
        # Creamos un ticket vía API
        res = self.client.post(reverse('tickets-list'), {
            'titulo': 'T1',
            'descripcion': 'D1',
            'prioridad': 'Alta'
        })
        self.assertEqual(res.status_code, 201)

        # Listamos y comprobamos que hay uno
        res2 = self.client.get(reverse('tickets-list'))
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(len(res2.data), 1)
        # Verificamos los campos
        ticket = res2.data[0]
        self.assertEqual(ticket['titulo'], 'T1')
        self.assertEqual(ticket['descripcion'], 'D1')
        self.assertEqual(ticket['prioridad'], 'Alta')
        self.assertEqual(ticket['estado'], 'Abierto')  # valor por defecto

    def test_metrics(self):
        # Creamos varios tickets directamente en la BD
        Ticket.objects.create(
            titulo='M1',
            descripcion='desc',
            estado='Abierto',
            prioridad='Media',
            usuario=self.user
        )
        Ticket.objects.create(
            titulo='M2',
            descripcion='desc',
            estado='Resuelto',
            prioridad='Alta',
            usuario=self.user
        )
        Ticket.objects.create(
            titulo='M3',
            descripcion='desc',
            estado='Abierto',
            prioridad='Baja',
            usuario=self.user
        )

        # Métrica por estado
        res_est = self.client.get(reverse('tickets_por_estado'))
        self.assertEqual(res_est.status_code, 200)
        # Debe haber al menos un 'Abierto'
        estados = { item['estado']: item['total'] for item in res_est.data }
        self.assertEqual(estados.get('Abierto', 0), 2)
        self.assertEqual(estados.get('Resuelto', 0), 1)

        # Métrica por prioridad
        res_pri = self.client.get(reverse('tickets_por_prioridad'))
        self.assertEqual(res_pri.status_code, 200)
        prioridades = { item['prioridad']: item['total'] for item in res_pri.data }
        self.assertEqual(prioridades.get('Media', 0), 1)
        self.assertEqual(prioridades.get('Alta', 0), 1)
        self.assertEqual(prioridades.get('Baja', 0), 1)
