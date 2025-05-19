// src/App.js

import React, { useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  useMediaQuery,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";

import Tickets from "./pages/Tickets";
import Metricas from "./pages/Metricas";
import Configuracion from "./pages/Configuracion";
import CrearUsuario from "./pages/CrearUsuario";
import TicketDetail from "./pages/TicketDetail";
import Login from "./pages/Login";
import LogoutButton from "./components/LogoutButton";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { usuario } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Color de AppBar según tipo
  const getAppBarBg = () => {
    if (!usuario) return theme.palette.primary.main;
    switch (usuario.tipo) {
      case "funcionario":
        return theme.palette.success.main;
      case "admin":
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main; 
    }
  };

  // ¿Puede ver métricas?
  const puedeVerMetricas =
    usuario?.tipo === "funcionario" || usuario?.tipo === "admin";

  // Enlaces del menú
  const NavLinks = (
    <>
      <Button color="inherit" component={Link} to="/tickets">
        Tickets
      </Button>

      {puedeVerMetricas && (
        <Button color="inherit" component={Link} to="/metricas">
          Métricas
        </Button>
      )}

      {usuario?.tipo === "admin" && (
        <>
          <Button color="inherit" component={Link} to="/configuracion">
            Configuración
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/configuracion/crear-usuario"
          >
            Crear Usuario
          </Button>
        </>
      )}
    </>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <CssBaseline />

      <AppBar position="static" sx={{ backgroundColor: getAppBarBg() }}>
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
                <MenuItem
                  component={Link}
                  to="/tickets"
                  onClick={handleMenuClose}
                >
                  Tickets
                </MenuItem>

                {puedeVerMetricas && (
                  <MenuItem
                    component={Link}
                    to="/metricas"
                    onClick={handleMenuClose}
                  >
                    Métricas
                  </MenuItem>
                )}

                {usuario?.tipo === "admin" && (
                  <>
                    <MenuItem
                      component={Link}
                      to="/configuracion"
                      onClick={handleMenuClose}
                    >
                      Configuración
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/configuracion/crear-usuario"
                      onClick={handleMenuClose}
                    >
                      Crear Usuario
                    </MenuItem>
                  </>
                )}
              </Menu>
            </>
          )}

          {/* Logo */}
          <img
            src="/logoappsinfondo.png"
            alt="Logo"
            style={{ height: 40, marginRight: 16 }}
          />

          {/* Título */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Sistema de Tickets Académicos
          </Typography>

          {/* Saludo */}
          {usuario && (
            <Typography sx={{ marginRight: 2 }}>
              Bienvenido
              {usuario.first_name
                ? `, ${usuario.first_name}`
                : `, ${usuario.username}`}
            </Typography>
          )}

          {/* Menú en desktop */}
          {usuario && !isMobile && NavLinks}

          {/* Cerrar sesión */}
          {usuario && <LogoutButton />}
        </Toolbar>
      </AppBar>

      <Box p={2}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {usuario ? (
            <>
              <Route
                path="/"
                element={<Navigate to="/tickets" replace />}
              />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />

              {/* Métricas: redirige si no está autorizado */}
              <Route
                path="/metricas"
                element={
                  !puedeVerMetricas ? (
                    <Navigate to="/tickets" replace />
                  ) : (
                    <Metricas />
                  )
                }
              />

              {usuario.tipo === "admin" && (
                <>
                  <Route
                    path="/configuracion"
                    element={<Configuracion />}
                  />
                  <Route
                    path="/configuracion/crear-usuario"
                    element={<CrearUsuario />}
                  />
                </>
              )}
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
