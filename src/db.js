import mongoose from "mongoose";

// Función para conectar a la base de datos MongoDB usando mongoose
export const connectDB = async () => {
  try {
    // Intentar conectar a la base de datos local 'regimedical'
    await mongoose.connect('mongodb://localhost/regimedical');
    console.log("✅ DB is connected");
  } catch (error) {
    // Mostrar error en consola si falla la conexión
    console.log(error);
  }
};
