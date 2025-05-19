import React, { useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import {
  Box, CssBaseline, AppBar, Toolbar, Typography,
  IconButton, Button, useMediaQuery, Menu, MenuItem
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";

import Tickets from "./pages/Tickets";
import Metricas from "./pages/Metricas";
import Historial from "./pages/Historial";
import Configuracion from "./pages/Configuracion";
import CrearUsuario from "./pages/CrearUsuario"; // ✅ Importar componente
import TicketDetail from "./pages/TicketDetail";
import Login from "./pages/Login";
import LogoutButton from "./components/LogoutButton";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { usuario } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const NavLinks = (
    <>
      <Button color="inherit" component={Link} to="/tickets">Tickets</Button>
      <Button color="inherit" component={Link} to="/metricas">Métricas</Button>
      <Button color="inherit" component={Link} to="/historial">Historial</Button>
      {usuario?.tipo === "admin" && (
        <>
          <Button color="inherit" component={Link} to="/configuracion">Configuración</Button>
          <Button color="inherit" component={Link} to="/configuracion/crear-usuario">Crear Usuario</Button>
        </>
      )}
    </>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          {usuario && isMobile && (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                onClick={handleMenuClick}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem component={Link} to="/tickets" onClick={handleMenuClose}>Tickets</MenuItem>
                <MenuItem component={Link} to="/metricas" onClick={handleMenuClose}>Métricas</MenuItem>
                <MenuItem component={Link} to="/historial" onClick={handleMenuClose}>Historial</MenuItem>
                {usuario?.tipo === "admin" && (
                  <>
                    <MenuItem component={Link} to="/configuracion" onClick={handleMenuClose}>Configuración</MenuItem>
                    <MenuItem component={Link} to="/configuracion/crear-usuario" onClick={handleMenuClose}>Crear Usuario</MenuItem>
                  </>
                )}
              </Menu>
            </>
          )}

          {/* Logo */}
          <img src="/logoappsinfondo.png" alt="Logo" style={{ height: 40, marginRight: 16 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Sistema de Tickets Académicos
          </Typography>

          {usuario && !isMobile && NavLinks}
          {usuario && <LogoutButton />}
        </Toolbar>
      </AppBar>

      <Box p={2}>
        <Routes>
          <Route path="/login" element={<Login />} />
          {usuario ? (
            <>
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
              <Route path="/metricas" element={<Metricas />} />
              <Route path="/historial" element={<Historial />} />
              {usuario.tipo === "admin" && (
                <>
                  <Route path="/configuracion" element={<Configuracion />} />
                  <Route path="/configuracion/crear-usuario" element={<CrearUsuario />} />
                </>
              )}
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
