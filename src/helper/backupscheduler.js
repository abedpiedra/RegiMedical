import cron from "node-cron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { generarRespaldo } from "./backupsHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = path.join(__dirname, "../backupConfig.json");

// Variable global para guardar la instancia actual del cron job
let tareaCron = null;

function leerIntervalo() {
  // Verificar si el archivo de configuración existe
  if (!fs.existsSync(configPath)) {
    return 10; // Retorna 10 minutos por defecto si no existe el archivo
  }
  // Leer y parsear el archivo JSON de configuración.
  const config = JSON.parse(fs.readFileSync(configPath));
  // Retorna el intervalo definido o 10 si no está especificado
  return config.intervalo || 10;
}

export function iniciarCron() {
  // Leer el intervalo de minutos para el cron
  const intervalo = leerIntervalo();
  console.log(`Iniciando respaldo automático cada ${intervalo} minutos.`);

  // Si ya existe un cron programado, detenerlo antes de crear uno nuevo
  if (tareaCron) {
    tareaCron.stop();
  }

  // Crear una nueva tarea programada que se ejecuta cada "intervalo" minutos
  tareaCron = cron.schedule(`*/${intervalo} * * * *`, async () => {
    console.log("Iniciando respaldo automático...");
    try {
      // Ejecutar la función para generar el respaldo
      const zipPath = await generarRespaldo();
      console.log(`Respaldo automático creado: ${zipPath}`);
    } catch (error) {
      // Manejar errores en la generación del respaldo
      console.error("Error en respaldo automático:", error);
    }
  });
}

// Ejecutar la función para iniciar el cron al arrancar el backend
iniciarCron();
