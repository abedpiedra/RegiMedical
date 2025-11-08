import { Router } from "express";
import { realizarRespaldo, restaurarBackup } from "../controllers/backups.controller.js";
import multer from "multer";

const router = Router();

// Para recibir el archivo ZIP de respaldo que subirás para restaurar
const upload = multer({ dest: 'uploads/' });

router.get("/backup", realizarRespaldo);

// Endpoint para restaurar respaldo, recibiendo un archivo ZIP
router.post("/restore", upload.single('backup'), restaurarBackup);

export default router;
