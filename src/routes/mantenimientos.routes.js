import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  mantenimiento,
  mantenimientos,
  deleteMantenimientos,
  obtenerMantenimientoPorId,
  obtenerMantenimientosPorSerie,
  actualizarMantenimiento,
} from "../controllers/mantenimientos.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { mantenimientoSchema } from "../schemas/mantenimientos.schema.js";
import { fileURLToPath } from "url";

const router = Router();

// === CONFIGURACIÓN MULTER ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// === RUTAS ===

// ✅ Crear mantenimiento (con parse intermedio)
router.post(
  "/savemantenimientos",
  upload.single("archivo"),
  (req, res, next) => {
    try {
      // Convertir parámetros operacionales de string a objeto
      if (req.body.parametros_operacionales) {
        req.body.parametros_operacionales = JSON.parse(
          req.body.parametros_operacionales
        );
      }

      // Asegurarse de que todos los campos existen aunque estén vacíos
      for (const key in req.body) {
        if (req.body[key] === "undefined" || req.body[key] === undefined) {
          req.body[key] = "";
        }
      }

      next();
    } catch (err) {
      console.error("Error al procesar parámetros operacionales:", err);
      return res
        .status(400)
        .json({ message: "Error al procesar parámetros operacionales" });
    }
  },
  validateSchema(mantenimientoSchema),
  mantenimiento
);

// Obtener todos los mantenimientos
router.get("/mantenimientos", mantenimientos);

// Obtener mantenimiento por ID
router.get("/mantenimientos/:id", obtenerMantenimientoPorId);

// Eliminar mantenimiento
router.delete("/deleteMantenimientos/:id", deleteMantenimientos);

// Actualizar mantenimiento
router.put("/mantenimientos/:id", actualizarMantenimiento);

// Obtener mantenimientos por serie
router.get("/mantenimientos/serie/:serie", obtenerMantenimientosPorSerie);

export default router;
