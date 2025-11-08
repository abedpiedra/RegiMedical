import axios from "axios";

const API = "http://localhost:4000/api";

// Crear una nueva venta
export const crearVentaRequest = (venta) => 
  axios.post(`${API}/ventas`, venta);

// Obtener todas las ventas (si lo necesitas)
export const obtenerVentasRequest = () =>
  axios.get(`${API}/ventas/`);

// Obtener venta por ID
export const obtenerVentaPorId = (id) =>
  axios.get(`${API}/ventas/${id}`);

// Opcional: eliminar venta por ID
export const eliminarVentaRequest = (id) =>
  axios.delete(`${API}/ventas/${id}`);

// Opcional: actualizar venta (PUT o PATCH)
export const actualizarVentaRequest = (id, datosActualizados) =>
  axios.put(`${API}/ventas/${id}`, datosActualizados);
