import mongoose from "mongoose";

const notificacionSchema = new mongoose.Schema(
  {
    mensaje: {
      type: String,
      required: true,
      trim: true,
    },
    leida: {
      type: Boolean,
      default: false,
    },
    rutaDestino: {
      type: String,
      default: null, // opcional: a dónde redirigir desde el frontend
    },
    tipo: {
      type: String,
      enum: ["proximo", "vencido", "general"],
      default: "general",
    },
    alertKey: {
      type: String,
      unique: true, // evita notificaciones duplicadas del mismo equipo/tipo/fecha
      sparse: true, // permite que no todas tengan clave
    },
  },
  {
    timestamps: true, // crea automáticamente createdAt y updatedAt
  }
);

// 🔹 índice adicional para mejorar búsquedas por estado
notificacionSchema.index({ leida: 1, createdAt: -1 });

export default mongoose.model("Notificacion", notificacionSchema);
