// src/api.js
import axios from "axios";

const API_URL = "http://192.168.200.46:8000/api/tickets/";

// 🔁 Token dinámico desde localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Token ${token}` } : {};
};

// Obtener todos los tickets
export const getTickets = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
};

// Crear un nuevo ticket
export const createTicket = async (titulo, descripcion, estado, prioridad) => {
  try {
    const response = await axios.post(
      API_URL,
      { titulo, descripcion, estado, prioridad },
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating ticket:", error);
  }
};

// Actualizar ticket
export const updateTicket = async (id, titulo, descripcion, estado, prioridad) => {
  try {
    const response = await axios.put(
      `${API_URL}${id}/`,
      { titulo, descripcion, estado, prioridad },
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating ticket:", error);
  }
};

// Eliminar ticket
export const deleteTicket = async (id) => {
  try {
    await axios.delete(`${API_URL}${id}/`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
  }
};
