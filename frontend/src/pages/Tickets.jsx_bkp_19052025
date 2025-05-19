// src/pages/Tickets.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getTickets, updateTicket } from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const estados = [
  { value: "Abierto", label: "Abierto" },
  { value: "En Revisión", label: "En Revisión" },
  { value: "Resuelto", label: "Resuelto" },
];

const prioridades = [
  { value: "Alta", label: "Alta" },
  { value: "Media", label: "Media" },
  { value: "Baja", label: "Baja" },
];

const localeText = {
  noRowsLabel: "Sin filas",
  columnMenuLabel: "Menú",
  columnMenuShowColumns: "Mostrar columnas",
  columnMenuFilter: "Filtrar",
  columnMenuHideColumn: "Ocultar",
  columnMenuUnsort: "Quitar orden",
  columnMenuSortAsc: "Orden ascendente",
  columnMenuSortDesc: "Orden descendente",
  toolbarDensity: "Densidad",
  toolbarDensityLabel: "Densidad",
  toolbarDensityCompact: "Compacta",
  toolbarDensityStandard: "Estándar",
  toolbarDensityComfortable: "Cómoda",
  footerRowSelected: (count) =>
    count !== 1
      ? `${count.toLocaleString()} filas seleccionadas`
      : `${count.toLocaleString()} fila seleccionada`,
  MuiTablePagination: {
    labelRowsPerPage: "Filas por página",
  },
};

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");
  const navigate = useNavigate();
  const { usuario } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const data = await getTickets();
    setTickets(data); // Ya vienen filtrados por el backend
  };

  const handleCellEditCommit = async (params) => {
    const { id, field, value } = params;
    const updatedTicket = tickets.find((ticket) => ticket.id === id);
    if (updatedTicket) {
      const cambios = { ...updatedTicket, [field]: value };
      await updateTicket(
        id,
        cambios.titulo,
        cambios.descripcion,
        cambios.estado,
        cambios.prioridad
      );
      fetchTickets();
    }
  };

  const columnas = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
      renderCell: (params) => (
        <strong
          style={{ cursor: "pointer", color: "#1976d2" }}
          onClick={() => navigate(`/tickets/${params.row.id}`)}
        >
          #{params.row.id}
        </strong>
      ),
    },
    {
      field: "titulo",
      headerName: "Título",
      flex: 1,
      editable: false,
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 2,
      editable: false,
    },
      usuario?.tipo !== "estudiante" && {
      field: "usuario",
      headerName: "Usuario",
      width: 150,
      valueGetter: (params) => params?.row?.usuario?.username || "—",
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 150,
      editable: usuario?.tipo !== "estudiante",
      type: "singleSelect",
      valueOptions: estados.map((e) => e.value),
    },
    {
      field: "prioridad",
      headerName: "Prioridad",
      width: 150,
      editable: usuario?.tipo !== "estudiante",
      type: "singleSelect",
      valueOptions: prioridades.map((p) => p.value),
    },
    {
      field: "creado_en",
      headerName: "Fecha creación",
      width: 200,
      renderCell: (params) => {
        if (!params.value) return "Sin fecha";
        const fecha = new Date(params.value);
        return fecha.toLocaleString("es-CL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
  ].filter(Boolean); // Elimina columnas nulas

  const ticketsFiltrados = tickets.filter((ticket) => {
    return (
      (filtroEstado === "todos" || ticket.estado === filtroEstado) &&
      (filtroPrioridad === "todos" || ticket.prioridad === filtroPrioridad) &&
      (ticket.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        ticket.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        ticket.id.toString().includes(busqueda))
    );
  });

  return (
    <Container maxWidth="lg">
      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
        Lista de Tickets
      </Typography>

      <Box sx={{ display: "flex", gap: 2, my: 2 }}>
        <TextField
          label="Buscar por ID, título o descripción"
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
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="todos">Todos</MenuItem>
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
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="todos">Todas</MenuItem>
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
          disableSelectionOnClick
          onCellEditCommit={handleCellEditCommit}
          localeText={localeText}
          getRowClassName={(params) =>
            params.row.prioridad === "Alta" && params.row.estado !== "Resuelto"
              ? "fila-prioridad-alta"
              : ""
          }
          sx={{
            "& .fila-prioridad-alta": {
              borderLeft: "6px solid red",
              backgroundColor: "#fff5f5",
            },
          }}
        />
      </Box>
    </Container>
  );
};

export default Tickets;
