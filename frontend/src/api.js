// frontend/src/api.js

const API_BASE = "http://192.168.200.46:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Token ${token}`,
  };
};

export const getTickets = async () => {
  const res = await fetch(`${API_BASE}/tickets/?perfil=true`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener tickets");
  return await res.json();
};

export const updateTicket = async (id, titulo, descripcion, estado, prioridad) => {
  const res = await fetch(`${API_BASE}/tickets/${id}/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ titulo, descripcion, estado, prioridad }),
  });
  if (!res.ok) throw new Error("Error al actualizar ticket");
  return await res.json();
};

export const updateTicketStatus = async (id, estado) => {
  const res = await fetch(`${API_BASE}/tickets/${id}/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) throw new Error("Error al actualizar estado del ticket");
  return await res.json();
};

export const createTicket = async (titulo, descripcion) => {
  const res = await fetch(`${API_BASE}/tickets/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ titulo, descripcion }),
  });
  if (!res.ok) throw new Error("Error al crear ticket");
  return await res.json();
};

export const getTicketDetail = async (id) => {
  const res = await fetch(`${API_BASE}/tickets/${id}/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener detalle del ticket");
  return await res.json();
};

export const getComentarios = async (ticketId) => {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}/comentarios/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener comentarios");
  return await res.json();
};

export const postComentario = async (ticketId, comentario) => {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}/comentarios/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(comentario),
  });
  if (!res.ok) throw new Error("Error al enviar comentario");
  return await res.json();
};

export const getEstado = async () => {
  const res = await fetch(`${API_BASE}/metricas/tickets-por-estado/`, {
    headers: getAuthHeaders(),
  });
  return await res.json();
};

export const getPrioridad = async () => {
  const res = await fetch(`${API_BASE}/metricas/tickets-por-prioridad/`, {
    headers: getAuthHeaders(),
  });
  return await res.json();
};

export const getArea = async () => {
  const res = await fetch(`${API_BASE}/metricas/tickets-por-area/`, {
    headers: getAuthHeaders(),
  });
  return await res.json();
};
