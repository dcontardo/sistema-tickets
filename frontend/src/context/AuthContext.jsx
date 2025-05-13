import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_URL = "http://192.168.200.46:8000/api";

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Verifica el token al cargar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${API_URL}/auth/yo/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        })
        .then((res) => {
          setUsuario(res.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUsuario(null);
        })
        .finally(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, []);

  // Guarda el usuario y token al iniciar sesión
  const login = ({ user, token }) => {
    setUsuario(user);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {!cargando && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
