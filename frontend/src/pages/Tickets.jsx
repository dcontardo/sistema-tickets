import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Box,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getTickets } from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const estados = [
  { value: "abierto", label: "Abierto" },
  { value: "en_revision", label: "En Revisión" },
  { value: "resuelto", label: "Resuelto" },
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
  const navigate = useNavigate();
  const { usuario } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const data = await getTickets();
    setTickets(data);
  };

  const columnasEstudiante = [
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
    {
      field: "estado",
      headerName: "Estado",
      width: 150,
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
  ];

  const columnasFuncionarioAdmin = [
    ...columnasEstudiante,
    {
      field: "usuario_username",
      headerName: "Usuario",
      width: 150,
    },
    {
      field: "prioridad",
      headerName: "Prioridad",
      width: 150,
      editable: true,
      type: "singleSelect",
      valueOptions: ["alta", "media", "baja"],
    },
  ];

  const columnas = usuario?.tipo === "estudiante"
    ? columnasEstudiante
    : columnasFuncionarioAdmin;

  const ticketsFiltrados = tickets.filter((ticket) => {
    return (
      (filtroEstado === "todos" || ticket.estado === filtroEstado) &&
      (ticket.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        ticket.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        ticket.id.toString().includes(busqueda))
    );
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Lista de Tickets
        </Typography>
        {usuario?.tipo === "estudiante" && (
          <Button variant="contained" onClick={() => navigate("/tickets/nuevo")}>
            Nuevo Ticket
          </Button>
        )}
      </Box>

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
      </Box>

      <Box sx={{ height: 600 }}>
        <DataGrid
          rows={ticketsFiltrados}
          columns={columnas}
          pageSize={100}
          rowsPerPageOptions={[20, 50, 100]}
          disableSelectionOnClick
          localeText={localeText}
        />
      </Box>
    </Container>
  );
}
