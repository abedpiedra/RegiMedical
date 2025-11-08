// Importamos mongoose para definir
// el esquema del modelo de equipos
import mongoose from "mongoose";

// Definimos el esquema de la
// colección de equipos
const equipoSchema = new mongoose.Schema(
  {
    serie: {
      type: String,
      required: true,
    },
    modelo: {
      type: String,
      required: true,
    },
    marca: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    estado: {
      type: String,
      required: true,
    },
    umantencion: {
      type: String,
      required: true,
    },
    pmantencion: {
      type: String,
      required: true,
    },
    proveedor: {
      type: String,
      required: true,
    },
    atributos_tecnicos: {
      type: mongoose.Schema.Types.Mixed, // acepta cualquier estructura
      default: {},
    },
    // === Foto ===
    foto_path: { type: String }, 
    foto_mime: { type: String },
    foto_size: { type: Number },
  },
  {
    // Agrega automáticamente campos `createdAt` y `updatedAt`
    timestamps: true,
  }
);

// Índice compuesto para evitar duplicados
// en combinación de serie y proveedor
equipoSchema.index({ serie: 1, proveedor: 1 }, { unique: true });

// Exportamos el modelo Equipo para la colección 'equipos'
export default mongoose.model("Equipo", equipoSchema);
