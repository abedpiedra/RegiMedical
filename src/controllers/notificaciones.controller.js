import Notificacion from "../models/notificaciones.model.js";

// 🟢 Crear una nueva notificación
export const crearNotificacion = async (req, res) => {
  try {
    const { mensaje, rutaDestino } = req.body;

    // Validar mensaje
    if (!mensaje || typeof mensaje !== "string" || mensaje.trim() === "") {
      return res
        .status(400)
        .json({ message: "El campo 'mensaje' es requerido." });
    }

    // Crear notificación y guardar en DB
    const notificacion = new Notificacion({
      mensaje: mensaje.trim(),
      leida: false, // todas las nuevas notificaciones comienzan como no leídas
      rutaDestino: rutaDestino || null, // opcional: para redirigir desde el frontend
    });

    await notificacion.save();

    return res.status(201).json({
      message: "Notificación creada correctamente",
      notificacion,
    });
  } catch (error) {
    console.error("Error al crear notificación:", error);
    return res.status(500).json({ message: error.message });
  }
};

// 🟡 Obtener solo las notificaciones no leídas (para la campanita)
export const obtenerNoLeidas = async (req, res) => {
  try {
    const notificaciones = await Notificacion.find({ leida: false }).sort({
      createdAt: -1, // las más recientes primero
    });

    return res.json(notificaciones);
  } catch (error) {
    console.error("Error al obtener no leídas:", error);
    return res.status(500).json({ message: error.message });
  }
};

// 🔵 Obtener todas las notificaciones (leídas y no leídas)
export const obtenerTodas = async (req, res) => {
  try {
    const notificaciones = await Notificacion.find().sort({ createdAt: -1 });
    return res.json(notificaciones);
  } catch (error) {
    console.error("Error al obtener todas:", error);
    return res.status(500).json({ message: error.message });
  }
};

// 🟣 Marcar una notificación específica como leída
export const marcarLeida = async (req, res) => {
  try {
    const { id } = req.params;

    const notificacion = await Notificacion.findByIdAndUpdate(
      id,
      { leida: true },
      { new: true } // devuelve el documento actualizado
    );

    if (!notificacion) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    return res.json({
      message: "Notificación marcada como leída",
      notificacion,
    });
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ⚫ Marcar todas las notificaciones como leídas (cuando se abre la campanita)
export const marcarTodasLeidas = async (req, res) => {
  try {
    const result = await Notificacion.updateMany(
      { leida: false },
      { $set: { leida: true } }
    );

    return res.json({
      message: `${result.modifiedCount} notificaciones marcadas como leídas`,
    });
  } catch (error) {
    console.error("Error al marcar todas como leídas:", error);
    return res.status(500).json({ message: error.message });
  }
};

// 🔴 Obtener una notificación por ID
export const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const notificacion = await Notificacion.findById(id);

    if (!notificacion) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    return res.json(notificacion);
  } catch (error) {
    console.error("Error al obtener notificación:", error);
    return res.status(500).json({ message: error.message });
  }
};
