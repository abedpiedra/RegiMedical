import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cron from "node-cron";

import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import proveedorRoutes from "./routes/proveedors.routes.js";
import equipoRoutes from "./routes/equipos.routes.js";
import notificacionesRoutes from "./routes/notificaciones.routes.js";
import backupRoutes from "./routes/backups.routes.js";
import backupConfigRoutes from "./routes/backupsconfig.routes.js";
import mantenimientosRoutes from "./routes/mantenimientos.routes.js";
import iaRoutes from "./routes/ia.routes.js";
import searchRoutes from "./routes/search.routes.js";
import { verificarFechasMantenimiento } from "./controllers/mantenimientos.controller.js";

dotenv.config();

const app = express();

// Paths base
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==== CORS (credenciales) ====
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: FRONT_ORIGIN,
    credentials: true,
    methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
    exposedHeaders: ["Content-Disposition"],
  })
);

// ==== Logs, parsers ====
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ==== Estáticos ====
const fotosDir = path.join(process.cwd(), "Equipos_Fotos");
if (!fs.existsSync(fotosDir)) fs.mkdirSync(fotosDir, { recursive: true });

// http://localhost:4000/Equipos_Fotos/archivo.jpg
app.use("/Equipos_Fotos", express.static(fotosDir));

// PDFs/Uploads
app.use("/api/ventas/pdfs", express.static(path.join(__dirname, "pdfs", "ventas")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==== Rutas API ====
app.use("/api", authRoutes);
app.use("/api", taskRoutes);
app.use("/api", proveedorRoutes);
app.use("/api", equipoRoutes);
app.use("/api", notificacionesRoutes);
app.use("/api", backupRoutes);
app.use("/api", backupConfigRoutes);
app.use("/api", mantenimientosRoutes);
app.use("/api", iaRoutes);
app.use("/api", searchRoutes);

// Salud simple
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ==== CRON: todos los días 08:00 America/Santiago ====
cron.schedule(
  "0 8 * * *",
  async () => {
    console.log("⏰ Verificando mantenimientos (±30 días)...");
    await verificarFechasMantenimiento(30);
  },
  { timezone: "America/Santiago" }
);

// (opcional) Ejecutar al iniciar
verificarFechasMantenimiento(30).catch(console.error);

export default app;
