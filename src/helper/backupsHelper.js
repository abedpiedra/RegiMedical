import { exec } from "child_process";      // Para ejecutar comandos del sistema (mongodump)
import path from "path";                   // Para manejar rutas de archivos
import fs from "fs";                       // Para operaciones con el sistema de archivos
import archiver from "archiver";          // Para crear archivos ZIP
import { fileURLToPath } from "url";       // Para obtener rutas en entorno ES modules
import { dirname } from "path";             // Para obtener el directorio actual
import dotenv from "dotenv";                // Para cargar variables de entorno desde archivo .env

dotenv.config();                           // Carga las variables de entorno

// Obtener la ruta del archivo actual y su directorio (compatible ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Definir carpeta donde se guardarán los backups ZIP
const backupsFolder = path.join(__dirname, "..", "backups");
// Definir carpeta donde están los PDFs que también queremos respaldar
const pdfsFolder = path.join(__dirname, "..", "pdfs", "ventas");

// Crear la carpeta backups si no existe para evitar errores al guardar archivos
if (!fs.existsSync(backupsFolder)) {
  fs.mkdirSync(backupsFolder, { recursive: true });
}

export const generarRespaldo = async () => {
  return new Promise((resolve, reject) => {
    // Obtener fecha actual para nombrar carpeta y ZIP, reemplazando ":" y "." para evitar problemas en nombres
    const fecha = new Date().toISOString().replace(/[:.]/g, "-");

    // Ruta temporal donde se guardará el dump de MongoDB
    const dumpPath = path.join(backupsFolder, `dump-${fecha}`);

    // URI de conexión a MongoDB (debe estar en .env, si no, usa localhost por defecto)
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/regimedical";

    // Comando mongodump para hacer el respaldo de la base de datos
    const comando = `mongodump --uri="${mongoUri}" --out="${dumpPath}"`;

    // Ejecutar el comando en el sistema
    exec(comando, (error, stdout, stderr) => {
      console.log("mongodump stdout:", stdout); // Mostrar salida estándar
      console.error("mongodump stderr:", stderr); // Mostrar posibles errores

      if (error) {
        console.error(`Error al hacer mongodump: ${error}`); // Mostrar error en consola
        return reject(error); // Rechazar la promesa si hubo error
      }

      // Validar que la carpeta dump fue creada correctamente
      if (!fs.existsSync(dumpPath)) {
        return reject(new Error("La carpeta dump no fue creada"));
      }

      // Leer archivos dentro de la carpeta dump para asegurar que no está vacía
      const filesDump = fs.readdirSync(dumpPath);
      console.log("Archivos en dump:", filesDump);

      if (filesDump.length === 0) {
        return reject(new Error("La carpeta dump está vacía"));
      }

      // Crear el archivo ZIP que contendrá el backup completo
      const zipPath = path.join(backupsFolder, `respaldo-${fecha}.zip`);
      const output = fs.createWriteStream(zipPath); // Crear stream de escritura para el ZIP
      const archive = archiver("zip", { zlib: { level: 9 } }); // Crear archivo ZIP con máxima compresión

      // Cuando termine de crear el ZIP, eliminar la carpeta temporal dump y resolver la promesa con la ruta del ZIP
      output.on("close", () => {
        fs.rmSync(dumpPath, { recursive: true, force: true }); // Eliminar carpeta temporal
        resolve(zipPath); // Devolver ruta del archivo ZIP generado
      });

      // Manejar errores durante la creación del ZIP
      archive.on("error", (err) => reject(err));

      // Conectar el stream de archivos con archiver
      archive.pipe(output);

      // Agregar la carpeta dump al ZIP dentro de una carpeta llamada "dump"
      archive.directory(dumpPath, "dump");

      // Si existe la carpeta de PDFs de ventas, agregarla al ZIP dentro de "pdfs/ventas"
      if (fs.existsSync(pdfsFolder)) {
        archive.directory(pdfsFolder, "pdfs/ventas");
      }

      // Finalizar el archivo ZIP (inicia la compresión y escritura)
      archive.finalize();
    });
  });
};
