// frontend/src/api/index.js

const API_URL = "http://localhost:8000/api"; // Cambia la URL si usas IP o producción

const getToken = () => localStorage.getItem("token");

// ----- Headers comunes -----
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Token ${getToken()}`,
});

// -------------------- Tickets --------------------
export const getTickets = async () => {
  const res = await fetch(`${API_URL}/tickets/`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al obtener tickets");
  return res.json();
};

export const createTicket = async (titulo, descripcion) => {
  const res = await fetch(`${API_URL}/tickets/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ titulo, descripcion }),
  });
  if (!res.ok) throw new Error("Error al crear ticket");
  return res.json(); // Devuelve ticket creado, incluyendo ID
};

export const getTicketDetail = async (id) => {
  const res = await fetch(`${API_URL}/tickets/${id}/`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al obtener detalle del ticket");
  return res.json();
};

export const updateTicket = async (id, titulo, descripcion, estado, prioridad) => {
  const res = await fetch(`${API_URL}/tickets/${id}/`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ titulo, descripcion, estado, prioridad }),
  });
  if (!res.ok) throw new Error("Error al actualizar ticket");
  return res.json();
};

// -------------------- Comentarios --------------------
export const getComentarios = async (ticketId) => {
  const res = await fetch(`${API_URL}/tickets/${ticketId}/comentarios/`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al obtener comentarios");
  return res.json();
};

export const postComentario = async (ticketId, comentario) => {
  const res = await fetch(`${API_URL}/tickets/${ticketId}/comentarios/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(comentario),
  });
  if (!res.ok) throw new Error("Error al enviar comentario");
  return res.json();
};

// -------------------- Usuarios --------------------
export const getUsuarios = async () => {
  const res = await fetch(`${API_URL}/usuarios/`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al obtener usuarios");
  return res.json();
};

// -------------------- Login --------------------
export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Login incorrecto");
  return res.json();
};

// -------------------- Yo (usuario autenticado) --------------------
export const getYo = async () => {
  const res = await fetch(`${API_URL}/yo/`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al obtener perfil");
  return res.json();
};
