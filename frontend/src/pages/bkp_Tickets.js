import React, { useEffect, useState } from "react";
import { Container, Typography, TextField, MenuItem, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getTickets } from "../api";

const estados = [
  { value: "todos", label: "Todos" },
  { value: "abierto", label: "Abierto" },
  { value: "en_revision", label: "En Revisión" },
  { value: "resuelto", label: "Resuelto" },
];

const prioridades = [
  { value: "todos", label: "Todas" },
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
];

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const data = await getTickets();
    setTickets(data);
  };

  const columnas = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "titulo", headerName: "Título", flex: 1 },
    { field: "estado", headerName: "Estado", width: 150 },
    { field: "prioridad", headerName: "Prioridad", width: 150 },
    {
      field: "creado_en",
      headerName: "Fecha creación",
      width: 200,
      valueGetter: (params) => {
        if (params.row && params.row.creado_en) {
          const date = new Date(params.row.creado_en);
          return date.toLocaleString();
        } else {
          return "Sin fecha";
        }
      },
    },
  ];

  const ticketsFiltrados = tickets.filter((ticket) => {
    return (
      (filtroEstado === "todos" || ticket.estado === filtroEstado) &&
      (filtroPrioridad === "todos" || ticket.prioridad === filtroPrioridad) &&
      (ticket.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        ticket.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    );
  });

  return (
    <Container maxWidth="lg">
      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
        Lista de Tickets
      </Typography>

      <Box sx={{ display: "flex", gap: 2, my: 2 }}>
        <TextField
          label="Buscar Tickets"
          variant="outlined"
          fullWidth
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <TextField
          select
          label="Estado"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          {estados.map((estado) => (
            <MenuItem key={estado.value} value={estado.value}>
              {estado.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Prioridad"
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          {prioridades.map((p) => (
            <MenuItem key={p.value} value={p.value}>
              {p.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ height: 500 }}>
        <DataGrid
          rows={ticketsFiltrados}
          columns={columnas}
          pageSize={100}
          rowsPerPageOptions={[100]}
          getRowId={(row) => row.id}
        />
      </Box>
    </Container>
  );
};

export default Tickets;
