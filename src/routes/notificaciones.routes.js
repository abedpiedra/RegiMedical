import { Router } from "express";
import {
  crearNotificacion,
  obtenerNoLeidas,
  obtenerTodas,
  obtenerPorId,
  marcarLeida,
  marcarTodasLeidas,
} from "../controllers/notificaciones.controller.js";

const router = Router();

// 🟢 Crear una nueva notificación
router.post("/notificaciones", crearNotificacion);

// 🟡 Obtener solo las no leídas (campanita)
router.get("/notificaciones", obtenerNoLeidas);

// 🔵 Obtener todas las notificaciones
router.get("/notificaciones/todas", obtenerTodas);

// 🔴 Obtener una notificación específica por ID
router.get("/notificaciones/:id", obtenerPorId);

// 🟣 Marcar una notificación como leída
router.put("/notificaciones/:id/leida", marcarLeida);

// ⚫ Marcar todas como leídas
router.put("/notificaciones/marcar-todas-leidas", marcarTodasLeidas);

export default router;
