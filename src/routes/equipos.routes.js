// routes/equipos.routes.js
import { Router } from "express";
import {
  equipo,
  equipos,
  obtenerEquipoPorId,
  deleteEquipos,
  actualizarEquipo,
  actualizarFotoEquipo,
  importarEquipos,
} from "../controllers/equipos.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { equipoSchema } from "../schemas/equipos.schema.js";
import { uploadFoto } from "../middlewares/uploadFoto.middleware.js";
import multer from "multer";

const router = Router();

// Crear (con foto opcional)
router.post(
  "/saveequipos",
  uploadFoto.single("foto"),
  validateSchema(equipoSchema),
  equipo
);

// Listar / Obtener / Eliminar
router.get("/equipos", equipos);
router.get("/equipos/:id", obtenerEquipoPorId);
router.delete("/deleteEquipos/:_id", deleteEquipos);

// Actualizar datos (sin foto)
router.put("/equipos/:id", validateSchema(equipoSchema.partial()), actualizarEquipo);

// Actualizar SOLO foto
router.put("/equipos/:id/foto", uploadFoto.single("foto"), actualizarFotoEquipo);

// Importar Excel + ZIP
const mem = multer({ storage: multer.memoryStorage() });
router.post(
  "/importar-equipos",
  mem.fields([
    { name: "excel", maxCount: 1 },
    { name: "imagenes_zip", maxCount: 1 },
  ]),
  importarEquipos
);

export default router;
