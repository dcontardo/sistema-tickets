import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://192.168.200.46:8000/api";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const manejarLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/auth/login/`, {
        username,
        password,
      });

      // ✅ Guardar token y usuario correctamente
      login({ user: res.data.user, token: res.data.token });
      navigate("/tickets");
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* ✅ Fondo del login */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: 'url("/fondosistematicket.webp")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      />
      {/* ✅ Capa difuminada */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          zIndex: 1,
        }}
      />
      {/* ✅ Formulario de login */}
      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Box
          p={4}
          boxShadow={3}
          borderRadius={3}
          bgcolor="rgba(255, 255, 255, 0.95)"
          textAlign="center"
          width="100%"
        >
          <img
            src="/logoappsinfondo.png"
            alt="Instituto Profesional del Sur"
            style={{ height: 80, marginBottom: 16 }}
          />

          <Typography variant="h5" gutterBottom>
            Iniciar Sesión
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={manejarLogin}
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
