import React from 'react';
import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <Button
      color="inherit"
      startIcon={<LogoutIcon />}
      onClick={logout}
    >
      Cerrar sesión
    </Button>
  );
};

export default LogoutButton;
