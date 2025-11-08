// Módulos y dependencias necesarias
import { exec } from 'child_process'; // Ejecuta comandos en la terminal
import path from 'path'; // Manejo de rutas de archivos
import fs from 'fs'; // Sistema de archivos
import unzipper from 'unzipper'; // Librería para descomprimir archivos ZIP
import { fileURLToPath } from 'url'; // Conversión de URL a ruta de archivo
import { dirname } from 'path'; // Obtener el directorio de un archivo
import dotenv from 'dotenv'; // Cargar variables de entorno
import { generarRespaldo } from '../helper/backupsHelper.js'; // Función personalizada para crear respaldos

// Cargar configuración del archivo .env
dotenv.config();

// Obtener rutas absolutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta a la carpeta donde se almacenan los backups
const backupsFolder = path.join(__dirname, '..', 'backups');

// Endpoint para generar y descargar un respaldo
export const realizarRespaldo = async (req, res) => {
  try {
    // Genera el respaldo y obtiene la ruta del archivo zip creado
    const zipPath = await generarRespaldo();

    // Obtiene solo el nombre del archivo desde la ruta
    const filename = path.basename(zipPath);

    // Envía el archivo como descarga al cliente
    res.download(zipPath, filename);
  } catch (error) {
    console.error("Error al generar respaldo:", error);
    res.status(500).json({ message: "Error al generar el respaldo" });
  }
};

// Endpoint para restaurar la base de datos desde un respaldo
export const restaurarBackup = async (req, res) => {
  try {
    // Verifica que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo" });
    }

    // Ruta temporal del archivo ZIP subido
    const backupZipPath = req.file.path;

    // Carpeta temporal donde se extraerá el contenido del ZIP
    const extractPath = path.join(backupsFolder, 'restore_temp');

    // Elimina la carpeta temporal si ya existía
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }
    fs.mkdirSync(extractPath, { recursive: true });

    // Extrae el contenido del ZIP en la carpeta temporal
    await fs.createReadStream(backupZipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();

    // Ruta donde se espera encontrar el dump de MongoDB dentro del ZIP
    const dumpPath = path.join(extractPath, 'dump');

    // Valida que exista la carpeta 'dump'
    if (!fs.existsSync(dumpPath)) {
      return res.status(400).json({ message: "El backup no contiene un dump válido" });
    }

    // URI de conexión a MongoDB (desde .env o valor por defecto)
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/regimedical';

    // Comando que restaura la base de datos y elimina los datos actuales (--drop)
    const comando = `mongorestore --uri="${mongoUri}" --drop --dir="${dumpPath}"`;

    // Ejecuta el comando en la terminal
    exec(comando, (error, stdout, stderr) => {
      // Elimina el archivo zip subido y la carpeta temporal después de la restauración
      fs.unlinkSync(backupZipPath);
      fs.rmSync(extractPath, { recursive: true, force: true });

      if (error) {
        console.error(`Error al restaurar backup: ${error}`);
        return res.status(500).json({ message: "Error al restaurar el backup" });
      }

      // Respuesta exitosa al cliente
      res.json({ message: "Backup restaurado correctamente" });
    });

  } catch (error) {
    console.error("Error en restaurarBackup:", error);
    res.status(500).json({ message: "Error en el proceso de restauración" });
  }
};
