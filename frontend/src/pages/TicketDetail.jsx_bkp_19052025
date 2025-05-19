// src/pages/TicketDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://192.168.200.46:8000/api";

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [estado, setEstado] = useState("");
  const [abrirConfirmacion, setAbrirConfirmacion] = useState(false);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Cargar ticket y validar acceso
    axios
      .get(`${API_BASE}/tickets/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        const t = res.data;
        // Perfilamiento: estudiantes solo suyos; funcionarios por área; admins todo
        if (
          usuario.tipo === "estudiante" &&
          t.usuario !== usuario.id
        ) {
          return navigate("/tickets");
        }
        if (
          usuario.tipo === "funcionario" &&
          t.area !== usuario.area
        ) {
          return navigate("/tickets");
        }
        setTicket(t);
        setEstado(t.estado);
      })
      .catch(() => navigate("/tickets"));

    // Cargar comentarios
    axios
      .get(`${API_BASE}/tickets/${id}/comentarios/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setComentarios(res.data))
      .catch((err) => console.error("Error cargando comentarios:", err));
  }, [id, usuario, navigate, token]);

  const manejarComentario = () => {
    if (!nuevoComentario.trim()) return;
    axios
      .post(
        `${API_BASE}/tickets/${id}/comentarios/`,
        { contenido: nuevoComentario },
        { headers: { Authorization: `Token ${token}` } }
      )
      .then((res) => {
        setComentarios((prev) => [...prev, res.data]);
        setNuevoComentario("");
      })
      .catch((err) => console.error("Error enviando comentario:", err));
  };

  const confirmarCambioEstado = () => {
    axios
      .patch(
        `${API_BASE}/tickets/${id}/`,
        { estado },
        { headers: { Authorization: `Token ${token}` } }
      )
      .then((res) => {
        setTicket(res.data);
        setMostrarAlerta(true);
        setAbrirConfirmacion(false);
      })
      .catch((err) => console.error("Error actualizando estado:", err));
  };

  if (!ticket) {
    return <div style={{ padding: "1rem" }}>Cargando ticket…</div>;
  }

  // Determinar si puede cambiar estado
  const puedeCambiarEstado =
    usuario.tipo === "funcionario" || usuario.tipo === "admin";

  return (
    <Box p={2}>
      <Button onClick={() => navigate(-1)} variant="outlined" sx={{ mb: 2 }}>
        ← Volver
      </Button>

      <Typography variant="h5" gutterBottom>
        {ticket.titulo}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {ticket.descripcion}
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel id="estado-label">Estado</InputLabel>
        <Select
          labelId="estado-label"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          label="Estado"
          disabled={!puedeCambiarEstado}
        >
          <MenuItem value="Abierto">Abierto</MenuItem>
          <MenuItem value="En Revisión">En Revisión</MenuItem>
          <MenuItem value="Resuelto">Resuelto</MenuItem>
        </Select>
      </FormControl>

      {puedeCambiarEstado && (
        <Button
          onClick={() => setAbrirConfirmacion(true)}
          variant="contained"
          sx={{ mt: 1 }}
        >
          Actualizar Estado
        </Button>
      )}

      <Typography variant="h6" mt={3}>
        Conversación
      </Typography>

      {comentarios.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Aún no hay comentarios.
        </Typography>
      ) : (
        comentarios.map((c) => (
          <Card key={c.id} sx={{ my: 1 }}>
            <CardContent>
              <Typography variant="body2">{c.contenido}</Typography>
              <Typography variant="caption" color="text.secondary">
                {c.usuario?.username} —{" "}
                {new Date(c.creado_en).toLocaleString("es-CL")}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}

      {/* Nueva caja de comentario */}
      <Box mt={2} display="flex" gap={1}>
        <TextField
          label="Nuevo comentario"
          fullWidth
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
        />
        <Button variant="contained" onClick={manejarComentario}>
          Enviar
        </Button>
      </Box>

      {/* Confirmación de estado */}
      <Dialog
        open={abrirConfirmacion}
        onClose={() => setAbrirConfirmacion(false)}
      >
        <DialogTitle>Confirmar cambio</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro de actualizar el estado del ticket?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAbrirConfirmacion(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmarCambioEstado} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alerta éxito */}
      <Snackbar
        open={mostrarAlerta}
        autoHideDuration={3000}
        onClose={() => setMostrarAlerta(false)}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Estado actualizado correctamente
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TicketDetail;
