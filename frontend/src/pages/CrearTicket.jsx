// frontend/src/pages/CrearTicket.jsx

import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../api";
import { useAuth } from "../context/AuthContext";

export default function CrearTicket() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
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

    if (!titulo || !descripcion) {
      setError("Título y descripción son obligatorios.");
      return;
    }

    try {
      const nuevoTicket = await createTicket(titulo, descripcion);
      setExito(`Ticket #${nuevoTicket.id} creado correctamente.`);
      setTitulo("");
      setDescripcion("");

      // Opcional: redirigir luego de 2.5 segundos
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
        <Button variant="contained" type="submit">
          Crear Ticket
        </Button>
      </form>
    </Box>
  );
}
