// Importamos axios para realizar peticiones HTTP
import axios from "axios";

// Definimos la URL base de la API
const API = "http://localhost:4000/api";

// =========================================
// Funciones para interactuar con la API de Mantenimientos
// =========================================

// Crear un nuevo mantenimiento (con archivo adjunto)
export const mantenimientoRequest = (formData) =>
  axios.post(`${API}/savemantenimientos`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Obtener todos los mantenimientos
export const mantenimientosRequest = () => axios.get(`${API}/mantenimientos`);

// Eliminar un mantenimiento por su ID
export const deleteMantenimiento = (id) =>
  axios.delete(`${API}/deleteMantenimientos/${id}`);

// Obtener un mantenimiento por ID
export const obtenerMantenimientoPorId = (id) =>
  axios.get(`${API}/mantenimientos/${id}`);

// Actualizar un mantenimiento por ID
export const actualizarMantenimiento = (id, data) =>
  axios.put(`${API}/mantenimientos/${id}`, data);
