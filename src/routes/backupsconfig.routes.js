import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { iniciarCron } from "../helper/backupscheduler.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = path.join(__dirname, "../backupConfig.json");

// GET: Obtener el intervalo actual
router.get("/config", (req, res) => {
  if (!fs.existsSync(configPath)) {
    return res.json({ intervalo: 10 }); // default si no existe
  }
  const config = JSON.parse(fs.readFileSync(configPath));
  res.json(config);
});

// POST: Guardar nuevo intervalo y reiniciar cron
router.post("/config", (req, res) => {
  const { intervalo } = req.body;

  if (!intervalo || intervalo <= 0) {
    return res.status(400).json({ message: "Intervalo inválido" });
  }

  fs.writeFileSync(configPath, JSON.stringify({ intervalo }));

  iniciarCron(); // 👈 Reinicia el cron con el nuevo intervalo

  res.json({ message: "Configuración guardada correctamente" });
});

export default router;
