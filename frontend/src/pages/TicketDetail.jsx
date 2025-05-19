// frontend/src/pages/TicketDetail.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTicketDetail,
  updateTicket,
  getComentarios,
  postComentario,
} from "../api";
import { useAuth } from "../context/AuthContext";

export default function TicketDetail() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [estado, setEstado] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [alerta, setAlerta] = useState(false);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    const data = await getTicketDetail(id);
    setTicket(data);
    setEstado(data.estado);
    setPrioridad(data.prioridad);

    const coments = await getComentarios(id);
    setComentarios(coments);

    // Bloquear si el usuario es estudiante y última acción fue suya o ticket está resuelto
    const ultimo = coments.at(-1);
    setBloqueado(
      usuario.tipo === "estudiante" &&
        (data.estado === "Resuelto" || ultimo?.usuario === usuario.id)
    );
  };

  const handleActualizarEstado = async () => {
    try {
      // Incluimos título y descripción actuales para evitar null
      await updateTicket(id, ticket.titulo, ticket.descripcion, estado, prioridad);
      await postComentario(id, {
        contenido: `Se cambia estado de ticket a ${estado}.`,
      });
      setOpenConfirm(false);
      setMensaje("Estado actualizado correctamente.");
      setAlerta(true);
      cargarDatos();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim()) return;
    try {
      await postComentario(id, { contenido: nuevoComentario });
      setNuevoComentario("");
      cargarDatos();
    } catch (error) {
      console.error("Error al comentar:", error);
    }
  };

  if (!ticket) return null;

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Button
        variant="outlined"
        onClick={() => navigate(-1)}
        fullWidth
        sx={{ mb: 4 }}
      >
        ← VOLVER
      </Button>

      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        {ticket.titulo}
      </Typography>
      <Typography sx={{ mb: 3, textAlign: 'center' }}>{ticket.descripcion}</Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        <strong>Creado por:</strong> {ticket.usuario_username} / {ticket.usuario_nombre}{' '}
        {ticket.usuario_apellido} / {ticket.usuario_email}
        <br />
        <strong>Fecha de creación:</strong>{' '}
        {new Date(ticket.creado_en).toLocaleString('es-CL')}
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography sx={{ mb: 1 }}><strong>Estado</strong></Typography>
        <Select
          fullWidth
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          disabled={usuario.tipo === 'estudiante'}
        >
          <MenuItem value="Abierto">Abierto</MenuItem>
          <MenuItem value="En Revisión">En Revisión</MenuItem>
          <MenuItem value="Resuelto">Resuelto</MenuItem>
        </Select>

        <Typography sx={{ mt: 3, mb: 1 }}><strong>Prioridad</strong></Typography>
        <Select
          fullWidth
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value)}
          disabled={usuario.tipo === 'estudiante'}
        >
          <MenuItem value="Alta">Alta</MenuItem>
          <MenuItem value="Media">Media</MenuItem>
          <MenuItem value="Baja">Baja</MenuItem>
        </Select>

        {usuario.tipo !== 'estudiante' && (
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            onClick={() => setOpenConfirm(true)}
          >
            ACTUALIZAR ESTADO
          </Button>
        )}
      </Box>

      <Typography variant="h6" sx={{ mb: 1 }}>Conversación</Typography>
      <Paper
        variant="outlined"
        sx={{ height: '30vh', overflowY: 'auto', p: 2, mb: 2 }}
      >
        {comentarios.length === 0 ? (
          <Typography>Aún no hay comentarios.</Typography>
        ) : (
          comentarios.map((comentario) => (
            <Box
              key={comentario.id}
              sx={{ mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}
            >
              <Typography>{comentario.contenido}</Typography>
              <Typography variant="caption" color="text.secondary">
                {comentario.usuario_username} —{' '}
                {new Date(comentario.creado_en).toLocaleString('es-CL')}
              </Typography>
            </Box>
          ))
        )}
      </Paper>

      <TextField
        label="Nuevo comentario"
        fullWidth
        multiline
        rows={3}
        disabled={bloqueado}
        value={nuevoComentario}
        onChange={(e) => setNuevoComentario(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        fullWidth
        onClick={handleEnviarComentario}
        disabled={bloqueado}
        sx={{ mb: 4 }}
      >
        ENVIAR
      </Button>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirmar cambio</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que deseas actualizar el estado del ticket?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>CANCELAR</Button>
          <Button onClick={handleActualizarEstado} autoFocus>
            CONFIRMAR
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alerta}
        autoHideDuration={3500}
        onClose={() => setAlerta(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {mensaje}
        </Alert>
      </Snackbar>
    </Container>
  );
}
