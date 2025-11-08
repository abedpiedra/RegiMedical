import mongoose from "mongoose";

const mantenimientoSchema = new mongoose.Schema(
  {
    fecha: { type: Date, required: true },
    serie: { type: String, required: true },
    lugar: { type: String, required: true },
    tipo: { type: String, required: true },
    responsable: { type: String, required: true },
    estado: {
      type: String,
      enum: ["Operativo", "En reparación", "Fuera de servicio"],
      required: true,
    },
    archivo: { type: String, required: true },
    observaciones: { type: String, required: false },
    parametros_operacionales: {
      type: Map,
      of: String,
      default: {},
    },
  },

  { timestamps: true }
);

export default mongoose.model("Mantenimiento", mantenimientoSchema);
