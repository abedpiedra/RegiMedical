import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  // Identificador del contador (ejemplo: "venta", "usuario", etc.)
  _id: {
    type: String,
    required: true,
  },
  // Secuencia numérica que se incrementa para generar IDs únicos o numeración correlativa
  seq: {
    type: Number,
    default: 0,
  },
});

// Modelo para manejar contadores usados en generación de secuencias automáticas
export const Counter = mongoose.model("Counter", counterSchema);
