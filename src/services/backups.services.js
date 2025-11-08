import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener ruta base
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Asegurarse de que la carpeta de backups existe
export const generarBackup = async () => {
  // Crear carpeta de backups si no existe
  try {
    // Verificar si la carpeta de backups ya existe
    const fecha = new Date().toISOString().replace(/[:.]/g, "-");
    // Ruta de la carpeta de backups
    const backupFolder = path.join(__dirname, "..", "backups", `backup-${fecha}`);
    // Verificar si la carpeta ya existe
    const dbBackupFolder = path.join(backupFolder, "db");
    // Ruta de la carpeta de PDFs
    const pdfsFolder = path.join(backupFolder, "pdfs");

    // Crear carpetas
    await fs.mkdir(dbBackupFolder, { recursive: true });
    await fs.mkdir(pdfsFolder, { recursive: true });

    // Backup de MongoDB
    const dbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/regimedical"; 
    const cmd = `mongodump --uri="${dbUri}" --out="${dbBackupFolder}"`;

    // Ejecutar el comando de backup
    await new Promise((resolve, reject) => {
      // Ejecutar el comando mongodump
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error("Error al ejecutar mongodump:", stderr);
          reject(error);
        } else {
          console.log("Backup DB completado:", stdout);
          resolve();
        }
      });
    });

    // Copiar PDFs
    const pdfsPath = path.join(__dirname, "..", "pdfs");
    // Verificar si la carpeta de PDFs existe
    await fs.cp(pdfsPath, pdfsFolder, { recursive: true });

    return { message: "Backup generado con éxito", ruta: backupFolder };
  } catch (err) {
    console.error(err);
    throw new Error("Error generando backup");
  }
};
