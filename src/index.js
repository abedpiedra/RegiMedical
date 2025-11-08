import app from './app.js';
import { connectDB } from './db.js';

// Conectar a la base de datos
connectDB();

// Iniciar el servidor
app.listen(4000, () => {
  console.log('✅ Server on port 4000');
});
