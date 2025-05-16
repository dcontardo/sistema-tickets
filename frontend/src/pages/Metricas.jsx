import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';

const Metricas = () => {
  const [porEstado, setPorEstado] = useState([]);
  const [porPrioridad, setPorPrioridad] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://192.168.200.46:8000/api/metricas/tickets-por-estado/', {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => setPorEstado(res.data))
    .catch(err => console.error('Error al obtener tickets por estado', err));

    axios.get('http://192.168.200.46:8000/api/metricas/tickets-por-prioridad/', {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => setPorPrioridad(res.data))
    .catch(err => console.error('Error al obtener tickets por prioridad', err));
  }, [token]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Métricas del Sistema</h2>

      <div style={{ marginBottom: '3rem' }}>
        <h3>Total de Tickets por Estado</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={porEstado} layout="vertical" margin={{ top: 20, right: 30, left: 50, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="estado" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3>Total de Tickets por Prioridad</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={porPrioridad} layout="vertical" margin={{ top: 20, right: 30, left: 50, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="prioridad" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#82ca9d" name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Metricas;
