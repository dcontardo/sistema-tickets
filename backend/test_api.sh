#!/usr/bin/env bash
set -euo pipefail

API_URL="http://192.168.200.46:8000/api"
TEMP_TOKEN=""

echo "=== 1. REGISTRO Y LOGIN ==="
USERNAME="user_test"
PASSWORD="Pass1234"

# 1.1 Registro
echo -n "Registering ${USERNAME}... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "${API_URL}/auth/register/" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\",\"password2\":\"${PASSWORD}\"}")
if [[ "$HTTP_CODE" != "201" ]]; then
  echo "FAILED (HTTP $HTTP_CODE)" && exit 1
fi
echo "OK"

# 1.2 Login
echo -n "Logging in ${USERNAME}... "
LOGIN_JSON=$(curl -s -X POST "${API_URL}/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}")
HTTP_CODE=$(echo "$LOGIN_JSON" | tail -n1)
if [[ "$HTTP_CODE" != "" ]]; then
  # In case curl appends code
  TOKEN=$(echo "$LOGIN_JSON" | jq -r .token)
else
  TOKEN=$(echo "$LOGIN_JSON" | jq -r .token)
fi
if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo "FAILED to get token" && exit 1
fi
echo "OK (token=${TOKEN:0:8}...)"


echo
echo "=== 2. ENDPOINT /auth/yo/ ==="
echo -n "Self GET... "
curl -s -o /dev/null -w "HTTP %{http_code}" \
  -H "Authorization: Token $TOKEN" \
  "${API_URL}/auth/yo/"
echo

echo
echo "=== 3. CRUD TICKETS ==="
# 3.1 List (empty)
echo -n "Initial list... "
curl -s -H "Authorization: Token $TOKEN" "${API_URL}/tickets/" | jq length | awk '{print "count="$1}'
# 3.2 Create
echo -n "Creating ticket... "
CREATE_JSON=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/tickets/" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Prueba","descripcion":"desc","prioridad":"Media"}')
HTTP_CODE=$(echo "$CREATE_JSON" | tail -n1)
if [[ "$HTTP_CODE" != "201" ]]; then echo "FAILED ($HTTP_CODE)" && exit 1; fi
TICKET_ID=$(echo "$CREATE_JSON" | head -n1 | jq -r .id)
echo "OK (id=$TICKET_ID)"

# 3.3 Retrieve
echo -n "Retrieving ticket #$TICKET_ID... "
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Token $TOKEN" \
  "${API_URL}/tickets/${TICKET_ID}/"
echo

# 3.4 Update
echo -n "Patching estado->Resuelto... "
curl -s -o /dev/null -w "%{http_code}" -X PATCH "${API_URL}/tickets/${TICKET_ID}/" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"estado":"Resuelto"}'
echo " OK"

# 3.5 Delete
echo -n "Deleting ticket... "
curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  -H "Authorization: Token $TOKEN" \
  "${API_URL}/tickets/${TICKET_ID}/"
echo " OK"

echo
echo "=== 4. COMENTARIOS ==="
# crear de nuevo para comentar
NEW_JSON=$(curl -s -X POST "${API_URL}/tickets/" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"ParaComentario","descripcion":"desc","prioridad":"Alta"}')
NEW_ID=$(echo "$NEW_JSON" | jq -r .id)
echo "Ticket #$NEW_ID creado"
echo -n "Añadiendo comentario... "
curl -s -o /dev/null -w "%{http_code}" -X POST "${API_URL}/tickets/${NEW_ID}/comentarios/" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contenido":"¡Hola equipo!"}'
echo " OK"
echo -n "Listando comentarios... "
curl -s -H "Authorization: Token $TOKEN" "${API_URL}/tickets/${NEW_ID}/comentarios/" | jq length | awk '{print "count="$1}'
echo

echo
echo "=== 5. MÉTRICAS ==="
for ep in tickets-por-estado tickets-por-prioridad tickets-por-area; do
  echo -n "$ep... "
  curl -s -H "Authorization: Token $TOKEN" "${API_URL}/metricas/${ep}/" | jq .
done

echo
echo "=== 6. TOKEN INVÁLIDO ==="
echo -n "Access with bad token... "
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Token invalid123" \
  "${API_URL}/tickets/"
echo

echo
echo "=== 7. ROLES Y PERFILAMIENTO ==="
# Crea un estudiante
echo -n " - Register student... "
curl -s -o /dev/null -X POST "${API_URL}/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{"username":"est","password":"p1","password2":"p1"}'
EST_TOKEN=$(curl -s -X POST "${API_URL}/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"est","password":"p1"}' | jq -r .token)
echo "OK"

echo -n " - Student sees only own tickets... "
curl -s -H "Authorization: Token $EST_TOKEN" "${API_URL}/tickets/" | jq .

echo
echo " - Register funcionario... "
curl -s -o /dev/null -X POST "${API_URL}/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{"username":"func","password":"p2","password2":"p2"}'
FUNC_TOKEN=$(curl -s -X POST "${API_URL}/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"func","password":"p2"}' | jq -r .token)
echo -n " - Funcionario sees only its area... "
curl -s -H "Authorization: Token $FUNC_TOKEN" "${API_URL}/tickets/" | jq .

echo
echo " - Admin user (user_test) sees all... "
curl -s -H "Authorization: Token $TOKEN" "${API_URL}/tickets/" | jq .

echo
echo "✅ TODAS LAS PRUEBAS COMPLETADAS ✅"
