import axios from "axios";

const API = "http://localhost:4000/api";

// Envía una solicitud POST al endpoint /register para registrar un nuevo usuario
export const registerRequest = (user) => axios.post(`${API}/register`, user);

// Envía una solicitud POST al endpoint /login para autenticar a un usuario
export const loginRequest = (user) => axios.post(`${API}/login`, user);
