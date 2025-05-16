// frontend/src/pages/CrearUsuario.jsx
import React, { useState, useEffect } from "react";
import {
  Container, TextField, Button, Typography, MenuItem,
  Box, Alert, Grid, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import * as XLSX from "xlsx";

const CrearUsuario = () => {
  const [form, setForm] = useState({
    username: "", email: "", password: "",
    first_name: "", last_name: "", tipo: "estudiante",
    area: "", escuela: "", carrera: ""
  });
  const [usuarios, setUsuarios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [escuelas, setEscuelas] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [carrerasFiltradas, setCarrerasFiltradas] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [alerta, setAlerta] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [filtroEscuela, setFiltroEscuela] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState(null);
  const [confirmarDialogo, setConfirmarDialogo] = useState(false);

  const headers = {
    Authorization: `Token ${localStorage.getItem("token")}`,
  };

  const fetchDatos = async () => {
    try {
      const [resUser, resUsuarios, resAreas, resEscuelas, resCarreras] = await Promise.all([
        axios.get("http://192.168.200.46:8000/api/auth/yo/", { headers }),
        axios.get("http://192.168.200.46:8000/api/usuarios/", { headers }),
        axios.get("http://192.168.200.46:8000/api/areas/", { headers }),
        axios.get("http://192.168.200.46:8000/api/escuelas/", { headers }),
        axios.get("http://192.168.200.46:8000/api/carreras/", { headers }),
      ]);
      setUsuarioActual(resUser.data);
      setUsuarios(resUsuarios.data);
      setAreas(resAreas.data);
      setEscuelas(resEscuelas.data);
      setCarreras(resCarreras.data);
    } catch (err) {
      console.error("Error al cargar datos", err);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  useEffect(() => {
    if (form.escuela) {
      const filtradas = carreras.filter(c => c.escuela === parseInt(form.escuela));
      setCarrerasFiltradas(filtradas);
    } else {
      setCarrerasFiltradas([]);
    }
  }, [form.escuela, carreras]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetFormulario = () => {
    setForm({ username: "", email: "", password: "", first_name: "", last_name: "", tipo: "estudiante", area: "", escuela: "", carrera: "" });
    setModoEdicion(false);
    setUsuarioEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlerta("");

    const camposObligatorios = ["username", "email", "first_name", "last_name"];
    for (let campo of camposObligatorios) {
      if (!form[campo]) {
        setAlerta("Por favor completa todos los campos obligatorios.");
        return;
      }
    }

    if (form.tipo === "estudiante" && (!form.escuela || !form.carrera)) {
      setAlerta("Escuela y carrera son obligatorias para estudiantes.");
      return;
    }

    if (form.tipo === "funcionario" && !form.area) {
      setAlerta("Área es obligatoria para funcionarios.");
      return;
    }

    // Validación de duplicados por username o email (solo en modo creación)
    if (!modoEdicion) {
      const usernameExistente = usuarios.some(u => u.username === form.username);
      const emailExistente = usuarios.some(u => u.email === form.email);
      if (usernameExistente || emailExistente) {
        setAlerta("⚠️ Ya existe un usuario con ese nombre o correo.");
        return;
      }
    }

    try {
      if (modoEdicion && usuarioEditandoId) {
        setConfirmarDialogo(true);
      } else {
        if (!form.password) {
          setAlerta("La contraseña es obligatoria al crear un usuario.");
          return;
        }
        await axios.post("http://192.168.200.46:8000/api/auth/register/", form, { headers });
        setAlerta("✅ Usuario creado correctamente.");
        resetFormulario();
        fetchDatos();
      }
    } catch (err) {
      console.error("Error al crear usuario", err);
      setAlerta("❌ Error al crear usuario.");
    }
  };

  const handleConfirmarActualizacion = async () => {
    try {
      await axios.put(`http://192.168.200.46:8000/api/usuarios/${usuarioEditandoId}/actualizar/`, form, { headers });
      setAlerta("✅ Usuario actualizado correctamente.");
      resetFormulario();
      fetchDatos();
    } catch (err) {
      console.error("Error al actualizar usuario", err);
      setAlerta("❌ Error al actualizar usuario.");
    } finally {
      setConfirmarDialogo(false);
    }
  };

  const handleEditar = (usuario) => {
    setForm({
      username: usuario.username,
      email: usuario.email,
      first_name: usuario.first_name,
      last_name: usuario.last_name,
      tipo: usuario.tipo,
      area: usuario.area || "",
      escuela: usuario.escuela || "",
      carrera: usuario.carrera || "",
      password: "",
    });
    setUsuarioEditandoId(usuario.id);
    setModoEdicion(true);
  };

  const handleEliminar = async (id) => {
    try {
      await axios.delete(`http://192.168.200.46:8000/api/usuarios/${id}/eliminar/`, { headers });
      setAlerta("✅ Usuario eliminado correctamente.");
      fetchDatos();
    } catch (err) {
      console.error("Error al eliminar", err);
      setAlerta("❌ No se pudo eliminar el usuario.");
    }
  };

  const exportarCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(usuarios);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    XLSX.writeFile(workbook, "usuarios.xlsx");
  };

  const columnas = [
    { field: "email", headerName: "Email", width: 200 },
    { field: "tipo", headerName: "Tipo", width: 130 },
    { field: "area_nombre", headerName: "Área", width: 160 },
    { field: "escuela_nombre", headerName: "Escuela", width: 160 },
    { field: "carrera_nombre", headerName: "Carrera", width: 200 },
    { field: "nombre_completo", headerName: "Nombre completo", width: 200 },
  ];

  if (usuarioActual?.tipo === "admin") {
    columnas.push({
      field: "acciones",
      headerName: "Acciones",
      width: 100,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEditar(params.row)}><EditIcon /></IconButton>
          <IconButton onClick={() => handleEliminar(params.row.id)}><DeleteIcon color="error" /></IconButton>
        </>
      ),
    });
  }

  const usuariosFiltrados = usuarios.filter(u =>
    (!filtroTipo || u.tipo === filtroTipo) &&
    (!filtroArea || u.area_nombre === filtroArea) &&
    (!filtroEscuela || u.escuela_nombre === filtroEscuela)
  );

  const renderCamposPorTipo = () => {
    if (form.tipo === "funcionario") {
      return (
        <Grid item xs={12} md={2}>
          <TextField select fullWidth label="Área" name="area" value={form.area} onChange={handleChange}>
            {areas.map(area => (
              <MenuItem key={area.id} value={area.id}>{area.nombre}</MenuItem>
            ))}
          </TextField>
        </Grid>
      );
    }

    if (form.tipo === "estudiante") {
      return (
        <>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Escuela" name="escuela" value={form.escuela} onChange={handleChange}>
              {escuelas.map(e => (
                <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Carrera" name="carrera" value={form.carrera} onChange={handleChange}>
              {carrerasFiltradas.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </>
      );
    }

    return null;
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h5">Crear nuevo usuario</Typography>
        {alerta && <Alert severity="info" sx={{ my: 2 }}>{alerta}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField label="Username" name="username" value={form.username} onChange={handleChange} fullWidth required /></Grid>
            <Grid item xs={12} md={2}><TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth required /></Grid>
            <Grid item xs={12} md={2}><TextField label="Nombre" name="first_name" value={form.first_name} onChange={handleChange} fullWidth required /></Grid>
            <Grid item xs={12} md={2}><TextField label="Apellido" name="last_name" value={form.last_name} onChange={handleChange} fullWidth required /></Grid>
            <Grid item xs={12} md={2}>
              <TextField label="Password" name="password" type="password" value={form.password} onChange={handleChange} fullWidth={!modoEdicion} required={!modoEdicion} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Tipo" name="tipo" value={form.tipo} onChange={handleChange}>
                <MenuItem value="estudiante">Estudiante</MenuItem>
                <MenuItem value="funcionario">Funcionario</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </TextField>
            </Grid>
            {renderCamposPorTipo()}
            <Grid item xs={12} md={2}>
              <Button variant="contained" fullWidth type="submit">
                {modoEdicion ? "GUARDAR CAMBIOS" : "CREAR USUARIO"}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Typography variant="h6" sx={{ mt: 4 }}>Usuarios creados</Typography>

        <Grid container spacing={2} sx={{ my: 2 }}>
          <Grid item xs={2}><TextField label="Filtrar por tipo" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} fullWidth /></Grid>
          <Grid item xs={2}><TextField label="Filtrar por área" value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)} fullWidth /></Grid>
          <Grid item xs={2}><TextField label="Filtrar por escuela" value={filtroEscuela} onChange={(e) => setFiltroEscuela(e.target.value)} fullWidth /></Grid>
          <Grid item xs={2}><Button variant="outlined" onClick={exportarCSV}>Exportar Excel</Button></Grid>
        </Grid>

        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={usuariosFiltrados}
            columns={columnas}
            pageSize={100}
            rowsPerPageOptions={[100]}
            getRowId={(row) => row.id}
            disableSelectionOnClick
          />
        </Box>
      </Box>

      <Dialog open={confirmarDialogo} onClose={() => setConfirmarDialogo(false)}>
        <DialogTitle>Confirmar actualización</DialogTitle>
        <DialogContent>¿Estás seguro de que deseas guardar los cambios de este usuario?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarDialogo(false)}>Cancelar</Button>
          <Button onClick={handleConfirmarActualizacion} autoFocus>Aceptar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CrearUsuario;
