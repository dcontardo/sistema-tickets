import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  TextField,
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
  Card,
  CardContent,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://192.168.200.46:8000/api";

export default function TicketDetail() {
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
    // Cargar ticket
    axios
      .get(`${API_BASE}/tickets/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        const t = res.data;
        // Perfilamiento
        if (
          usuario.tipo === "estudiante" &&
          t.usuario !== usuario.id
        ) {
          return navigate("/tickets");
        }
        if (
          usuario.tipo === "funcionario" &&
          t.area_nombre !== usuario.area_nombre
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
      .catch((err) => console.error(err));
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
      .catch((err) => console.error(err));
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
      .catch((err) => console.error(err));
  };

  if (!ticket) {
    return <Typography sx={{ p: 2 }}>Cargando ticket…</Typography>;
  }

  const puedeCambiarEstado =
    usuario.tipo === "funcionario" || usuario.tipo === "admin";

  return (
    <Box p={2}>
      <Button onClick={() => navigate(-1)} variant="outlined" sx={{ mb: 2 }}>
        ← Volver
      </Button>

      <Typography variant="h5">{ticket.titulo}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        {ticket.descripcion}
      </Typography>

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Solicitado por: {ticket.usuario_username}
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
          <MenuItem value="abierto">Abierto</MenuItem>
          <MenuItem value="en_revision">En Revisión</MenuItem>
          <MenuItem value="resuelto">Resuelto</MenuItem>
        </Select>
      </FormControl>

      {puedeCambiarEstado && (
        <Button
          onClick={() => setAbrirConfirmacion(true)}
          variant="contained"
          sx={{ mb: 3 }}
        >
          Actualizar Estado
        </Button>
      )}

      <Typography variant="h6" gutterBottom>
        Conversación
      </Typography>

      {comentarios.length === 0 ? (
        <Typography color="text.secondary">Aún no hay comentarios.</Typography>
      ) : (
        comentarios.map((c) => (
          <Card key={c.id} sx={{ mb: 1 }}>
            <CardContent>
              <Typography variant="body2">{c.contenido}</Typography>
              <Typography variant="caption" color="text.secondary">
                {c.usuario_username} —{" "}
                {new Date(c.creado_en).toLocaleString("es-CL", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}

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

      {/* Diálogo de confirmación */}
      <Dialog
        open={abrirConfirmacion}
        onClose={() => setAbrirConfirmacion(false)}
      >
        <DialogTitle>Confirmar cambio</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que deseas actualizar el estado del ticket?
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

      {/* Alerta de éxito */}
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
}
