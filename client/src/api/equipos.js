// Importamos axios para realizar peticiones HTTP
import axios from "axios";
// Definimos la URL base de la API
const API = "http://localhost:4000/api";
// Funciones para interactuar con la API de equipos
export const equipoRequest = (equipo) => axios.post(`${API}/`, equipo);
// Función para crear un nuevo equipo
export const equiposRequest = () => axios.get(`${API}/equipos`);
// Función para obtener todos los equipos
export const deleteEquipo = (_id) => axios.delete(`${API}/deleteEquipos/${_id}`);   
// Función para eliminar un equipo por su ID
export const obtenerEquipoPorId = (id) => axios.get(`${API}/equipos/${id}`);

export const actualizarEquipo = (id, equipoData) =>
  axios.put(`${API}/equipos/${id}`, equipoData);