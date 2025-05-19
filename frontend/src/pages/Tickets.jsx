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
  { value: "abierto", label: "Abierto" },
  { value: "en_revision", label: "En Revisión" },
  { value: "resuelto", label: "Resuelto" },
];

const prioridades = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
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

export default function Tickets() {
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
    setTickets(data);
  };

  const handleCellEditCommit = async (params) => {
    const { id, field, value } = params;
    const ticketOriginal = tickets.find((t) => t.id === id);
    if (!ticketOriginal) return;

    const payload = {
      titulo: ticketOriginal.titulo,
      descripcion: ticketOriginal.descripcion,
      estado: field === "estado" ? value : ticketOriginal.estado,
      prioridad: field === "prioridad" ? value : ticketOriginal.prioridad,
    };

    await updateTicket(id, payload.titulo, payload.descripcion, payload.estado, payload.prioridad);
    fetchTickets();
  };

  const columnas = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      renderCell: (params) => (
        <strong
          style={{ cursor: "pointer", color: "#1976d2" }}
          onClick={() => navigate(`/tickets/${params.row.id}`)}
        >
          #{params.row.id}
        </strong>
      ),
    },
    { field: "titulo", headerName: "Título", flex: 1, minWidth: 200 },
    { field: "descripcion", headerName: "Descripción", flex: 2, minWidth: 300 },
    usuario?.tipo !== "estudiante" && {
      field: "usuario_username",
      headerName: "Usuario",
      width: 150,
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
  ].filter(Boolean);

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
          {estados.map((e) => (
            <MenuItem key={e.value} value={e.value}>
              {e.label}
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

      <Box sx={{ height: 600 }}>
        <DataGrid
          rows={ticketsFiltrados}
          columns={columnas}
          pageSize={100}
          rowsPerPageOptions={[20, 50, 100]}
          disableSelectionOnClick
          onCellEditCommit={handleCellEditCommit}
          localeText={localeText}
          getRowClassName={(params) =>
            params.row.prioridad === "alta" && params.row.estado !== "resuelto"
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
}
