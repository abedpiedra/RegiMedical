// Importamos axios para realizar peticiones HTTP
import axios from "axios";
// Definimos la URL base de la API
const API = "http://localhost:4000/api";
// Funciones para interactuar con la API de proveedores
export const proveedorRequest = (proveedor) => axios.post(`${API}/proveedor`, proveedor)
// Función para crear un nuevo proveedor
export const proveedoresRequest = (proveedor) => axios.get(`${API}/proveedors`, proveedor)
// Función para obtener todos los proveedores
export const deleteProveedor = (_id) => axios.delete(`${API}/deleteProveedors/${_id}`);   
// Función para eliminar un proveedor por su ID
export const obtenerProveedorPorId = (id) => axios.get(`${API}/proveedors/${id}`);
