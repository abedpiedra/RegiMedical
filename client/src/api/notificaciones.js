import axios from "axios";

const API = "http://localhost:4000/api";

// Solicita todas las notificaciones desde el backend
export const obtenerNotificacionesRequest = () => axios.get(`${API}/notificaciones`);

// Marca una notificación específica como leída enviando una solicitud PUT con el ID de la notificación
export const marcarNotificacionLeidaRequest = (id) => axios.put(`${API}/notificaciones/${id}/leida`);
