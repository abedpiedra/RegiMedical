import axios from "axios";

const API = "http://localhost:4000/api";

// Envía una solicitud POST para crear una nueva alerta de stock
export const crearAlertaRequest = (alerta) => axios.post(`${API}/alertas`, alerta);

// Envía una solicitud GET para verificar las alertas de stock existentes
export const verificarAlertasRequest = () => axios.get(`${API}/alertas/verificar`);
