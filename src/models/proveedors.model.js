// Importamos mongoose para definir 
// el esquema del modelo de proveedores
import mongoose from "mongoose";
// Definimos el esquema de la 
// colección de equipos
const userSchema = new mongoose.Schema(
  {
    // Nombre del proveedor
    nombre_empresa: {
      type: String,
      required: true,
      unique: true,
    },
    // Nombre del contacto del proveedor
    direccion: {
      type: String,
      required: true,
      trim: true,
    },
    // Teléfono del proveedor
    telefono: {
      type: String,
      required: true,
      trim: true,
    },
    // Correo electrónico del proveedor
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  {
    // Esta opción agrega automáticamente campos `createdAt` y `updatedAt`
    timestamps: true,
  }
);
export default mongoose.model("Proveedor", userSchema);
