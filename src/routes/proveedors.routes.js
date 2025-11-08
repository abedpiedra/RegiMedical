import { Router } from "express";
// Importamos funciones del controlador para manejar proveedores
import {
  obtenerProveedorPorId,
  proveedor,
  proveedors,
  deleteProveedors,
  actualizarProveedor,
} from "../controllers/proveedors.controller.js";
// Middleware para validar datos según esquema definido
import { validateSchema } from "../middlewares/validator.middleware.js";
// Esquema de validación para datos de proveedor
import { proveedorSchema } from "../schemas/proveedors.schema.js";

const router = Router();

// Ruta para crear un nuevo proveedor con validación de esquema
router.post("/saveproveedors", validateSchema(proveedorSchema), proveedor);
// Ruta para obtener la lista de todos los proveedores
router.get("/proveedors", proveedors);
// Ruta para eliminar un proveedor por ID
router.delete("/deleteProveedors/:_id", deleteProveedors);
// Ruta para actualizar un proveedor por ID
router.put("/proveedors/:id", actualizarProveedor);
// Ruta para obtener un proveedor específico por ID
router.get("/proveedors/:id", obtenerProveedorPorId);

export default router;
