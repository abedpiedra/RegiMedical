import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    // Título de la tarea
    title: {
      type: String,
      required: true,
    },
    // Descripción detallada de la tarea
    description: {
      type: String,
      required: true,
    },
    // Fecha de la tarea
    // Nota: 'required' debe ser booleano, no string ni otro tipo
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Referencia al usuario dueño de la tarea
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    // Agrega automáticamente campos createdAt y updatedAt
    timestamps: true,
  }
);

// Exporta el modelo Task para la colección 'tasks'
export default mongoose.model("Task", taskSchema);
