import express from 'express';
import multer from 'multer';
import { restaurarBackup } from '../controllers/backups.controller.js';

const router = express.Router();

// Configura multer para guardar archivos subidos en la carpeta temporal 'uploads/'
const upload = multer({ dest: 'uploads/' });

// Ruta POST /restore que recibe un solo archivo llamado 'backup' para restaurar respaldo
router.post('/restore', upload.single('backup'), restaurarBackup);

export default router;
