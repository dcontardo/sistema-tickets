import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import BarChartIcon from '@mui/icons-material/BarChart';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';

const Sidebar = () => {
  return (
    <Drawer variant="permanent">
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon><ConfirmationNumberIcon /></ListItemIcon>
          <ListItemText primary="Tickets" />
        </ListItem>
        <ListItem button component={Link} to="/metricas">
          <ListItemIcon><BarChartIcon /></ListItemIcon>
          <ListItemText primary="Métricas" />
        </ListItem>
        <ListItem button component={Link} to="/historial">
          <ListItemIcon><HistoryIcon /></ListItemIcon>
          <ListItemText primary="Historial" />
        </ListItem>
        <ListItem button component={Link} to="/configuracion">
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Configuración" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
