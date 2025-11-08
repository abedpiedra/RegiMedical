import { Router } from "express";
// Middleware que verifica que el usuario esté autenticado
import { authRequired } from "../middlewares/validateToken.js";
// Importamos las funciones del controlador de tareas
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/tasks.controller.js";

const router = Router();

// Rutas protegidas con authRequired para operaciones CRUD en tareas

// Obtener todas las tareas del usuario autenticado
router.get("/tasks", authRequired, getTasks);
// Obtener una tarea específica por ID
router.get("/tasks/:id", authRequired, getTask);
// Crear una nueva tarea
router.post("/tasks", authRequired, createTask);
// Eliminar una tarea por ID
router.delete("/tasks/:id", authRequired, deleteTask);
// Actualizar una tarea por ID
router.put("/tasks/:id", authRequired, updateTask);

export default router;
