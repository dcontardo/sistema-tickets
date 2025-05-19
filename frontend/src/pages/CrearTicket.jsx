// frontend/src/pages/CrearTicket.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../api";
import { useAuth } from "../context/AuthContext";

export default function CrearTicket() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const navigate = useNavigate();
  const { usuario } = useAuth();

  useEffect(() => {
    if (usuario?.tipo !== "estudiante") {
      navigate("/tickets");
    }
  }, [usuario, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!titulo || !descripcion || !categoria) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const nuevoTicket = await createTicket(titulo, descripcion, categoria);
      setExito(`Ticket #${nuevoTicket.id} creado correctamente.`);
      setTitulo("");
      setDescripcion("");
      setCategoria("");

      // Redirige luego de mostrar el mensaje
      setTimeout(() => {
        navigate("/tickets");
      }, 2500);

    } catch (err) {
      setError("Error al crear ticket: " + err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Nuevo Ticket
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {exito && <Alert severity="success" sx={{ mb: 2 }}>{exito}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Título"
          fullWidth
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          sx={{ mb: 2 }}
          required
        />

        <TextField
          label="Descripción"
          fullWidth
          multiline
          minRows={4}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          sx={{ mb: 2 }}
          required
        />

        <FormControl fullWidth sx={{ mb: 2 }} required>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            label="Categoría"
          >
            <MenuItem value="admisión">Admisión</MenuItem>
            <MenuItem value="registro académico">Registro Académico</MenuItem>
            <MenuItem value="financiamiento">Financiamiento</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" type="submit">
          Crear Ticket
        </Button>
      </form>
    </Box>
  );
}
