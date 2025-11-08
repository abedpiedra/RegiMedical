// Importamos el Router de Express para definir las rutas de la API
import { Router } from "express";
// Importamos las funciones del controlador de autenticación
import {
  login,
  register,
  logout,
  profile,
} from "../controllers/auth.controller.js";

// Importamos middleware para proteger rutas (requiere token válido)
import { authRequired } from "../middlewares/validateToken.js";
// Importamos middleware para validar que los datos recibidos cumplan con un esquema
import { validateSchema } from "../middlewares/validator.middleware.js";
// Importamos los esquemas de validación para el registro y login
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
// Creamos una instancia del Router
const router = Router();
// Definimos las rutas de autenticación y asociamos cada ruta con su controlador
router.post("/register", validateSchema(registerSchema), register);
// Ruta para el registro de usuarios, valida los datos con el esquema registerSchema
router.post("/login", validateSchema(loginSchema), login);
// Ruta para el inicio de sesión, valida los datos con el esquema loginSchema
router.post("/logout", logout);
// Ruta para el cierre de sesión, no requiere validación de datos
router.get("/profile", authRequired, profile);

export default router;
