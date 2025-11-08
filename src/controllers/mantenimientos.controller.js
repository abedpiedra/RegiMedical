// controllers/mantenimientos.controller.js
import Mantenimiento from "../models/mantenimientos.model.js";
import Equipo from "../models/equipos.model.js";
import Notificacion from "../models/notificaciones.model.js";

/* ============================
   Helpers de fecha (timezone-safe)
   ============================ */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d, n) => new Date(d.getTime() + n * MS_PER_DAY);

/**
 * Intenta parsear una fecha que podría venir como:
 *  - Date (válida)
 *  - "YYYY-MM-DD" o ISO
 *  - "DD-MM-YYYY"
 *  - otros strings que Date pueda interpretar.
 * Devuelve Date o null si no es parseable.
 */
export function parseFechaFlexible(v) {
  if (!v) return null;
  if (v instanceof Date && !isNaN(v)) return v;

  const s = String(v).trim();
  if (!s) return null;

  // YYYY-MM-DD o ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }

  // DD-MM-YYYY
  const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) {
    const [_, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(d) ? null : d;
  }

  const d = new Date(s);
  return isNaN(d) ? null : d;
}

/**
 * Crea/actualiza UNA notificación para un equipo (deduplicada por alertKey).
 * - tipo "vencido" si pmantencion <= hoy
 * - tipo "proximo" si hoy < pmantencion <= hoy + dentroDeDias
 * - Fuera de ventana: no crea nada.
 * Devuelve { changed, tipo, fechaISO, reason }
 */
export async function upsertNotificacionMantenimientoEquipo(eq, dentroDeDias = 30) {
  if (!eq) return { changed: false, reason: "no-eq" };

  const hoy = startOfDay(new Date());
  const p = parseFechaFlexible(eq.pmantencion);
  if (!p) return { changed: false, reason: "no-pmantencion" };

  const mant = startOfDay(p);
  const diff = Math.ceil((mant - hoy) / MS_PER_DAY);
  const vencido = diff <= 0;
  const dentroVentana = diff > 0 && diff <= dentroDeDias;

  if (!vencido && !dentroVentana) {
    return { changed: false, reason: "fuera-de-ventana" };
  }

  const tipo = vencido ? "vencido" : "proximo";
  const fechaISO = mant.toISOString().slice(0, 10); // YYYY-MM-DD
  const alertKey = `${eq._id}:${tipo}:${fechaISO}`;
  const mensaje =
    tipo === "vencido"
      ? `🚨 El equipo "${eq.marca} ${eq.modelo}" (serie ${eq.serie}) tiene mantenimiento VENCIDO desde ${mant.toLocaleDateString("es-CL")}.`
      : `⚠️ El equipo "${eq.marca} ${eq.modelo}" (serie ${eq.serie}) requiere mantenimiento antes del ${mant.toLocaleDateString("es-CL")}.`;

  const doc = await Notificacion.findOneAndUpdate(
    { alertKey },
    {
      $setOnInsert: {
        mensaje,
        rutaDestino: `/equipos/${eq._id}`,
        leida: false,
        tipo,
        alertKey,
      },
    },
    { upsert: true, new: true }
  );

  const createdNow =
    doc?.createdAt && doc?.updatedAt && doc.createdAt.getTime() === doc.updatedAt.getTime();

  if (createdNow) {
    console.log(
      `🔔 Notificación ${tipo.toUpperCase()} generada para ${eq.serie} (fecha ${fechaISO})`
    );
  }

  return { changed: !!createdNow, tipo, fechaISO };
}

/* =====================================
   Verificador global (para cron/arranque)
   ===================================== */
/**
 * Recorre todos los equipos con pmantencion y crea UNA notificación por equipo/tipo/fecha.
 * tipo = "proximo" si la fecha cae <= intervalo; "vencido" si ya pasó.
 */
export const verificarFechasMantenimiento = async (intervaloDias = 30) => {
  const resumen = { revisados: 0, proximo: 0, vencido: 0, creadas: 0, errores: 0 };

  try {
    const hoy = startOfDay(new Date());
    const limite = addDays(hoy, intervaloDias);

    const equipos = await Equipo.find({
      pmantencion: { $exists: true, $ne: null },
    }).lean();

    for (const eq of equipos) {
      resumen.revisados++;

      const parsed = parseFechaFlexible(eq.pmantencion);
      if (!parsed) {
        console.warn(`⚠️ pmantencion inválida para serie ${eq.serie}:`, eq.pmantencion);
        resumen.errores++;
        continue;
      }
      const mant = startOfDay(parsed);

      if (mant > limite) continue;

      const tipo = mant <= hoy ? "vencido" : "proximo";
      if (tipo === "vencido") resumen.vencido++; else resumen.proximo++;

      const fechaISO = mant.toISOString().slice(0, 10); // YYYY-MM-DD
      const alertKey = `${eq._id}:${tipo}:${fechaISO}`;

      const mensaje =
        tipo === "vencido"
          ? `🚨 El equipo "${eq.marca} ${eq.modelo}" (serie ${eq.serie}) tiene mantenimiento VENCIDO desde ${mant.toLocaleDateString("es-CL")}.`
          : `⚠️ El equipo "${eq.marca} ${eq.modelo}" (serie ${eq.serie}) requiere mantenimiento antes del ${mant.toLocaleDateString("es-CL")}.`;

      const doc = await Notificacion.findOneAndUpdate(
        { alertKey },
        {
          $setOnInsert: {
            mensaje,
            rutaDestino: `/equipos/${eq._id}`,
            leida: false,
            tipo,
            alertKey,
          },
        },
        { upsert: true, new: true }
      );

      if (doc?.createdAt && doc?.updatedAt && doc.createdAt.getTime() === doc.updatedAt.getTime()) {
        resumen.creadas++;
        console.log(
          `🔔 Verificación: equipo ${eq.serie} → ${tipo === "vencido" ? "🚨 vencido" : "⚠️ próximo"}`
        );
      }
    }

    console.log(
      `✅ Verificador: revisados=${resumen.revisados}, proximo=${resumen.proximo}, vencido=${resumen.vencido}, creadas=${resumen.creadas}, errores=${resumen.errores}`
    );
    return resumen;
  } catch (error) {
    console.error("❌ Error al verificar fechas de mantenimiento:", error);
    throw error;
  }
};

/* ===========================================
   Re-verificar SOLO por serie (uso puntual)
   =========================================== */
/**
 * Relee el equipo por serie y corre upsertNotificacionMantenimientoEquipo.
 * Útil tras actualizar pmantencion/umantencion/estado de un único equipo.
 */
export async function reverificarPorSerie(serie, dentroDeDias = 30) {
  if (!serie) return { ok: false, reason: "no-serie" };
  const eq = await Equipo.findOne({ serie }).lean();
  if (!eq) return { ok: false, reason: "no-equipo" };
  const r = await upsertNotificacionMantenimientoEquipo(eq, dentroDeDias);
  return { ok: true, ...r };
}

/* ===========================
   CRUD de Mantenimientos
   =========================== */

// Crear mantenimiento
export const mantenimiento = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Debe adjuntar un archivo" });
    }

    const {
      fecha,
      serie,
      lugar,
      tipo,
      responsable,
      estado,
      observaciones,
      parametros_operacionales,
    } = req.body;

    const nuevo = new Mantenimiento({
      fecha,
      serie,
      lugar,
      tipo,
      responsable,
      estado,
      archivo: req.file.filename,
      observaciones,
      parametros_operacionales,
    });

    await nuevo.save();

    // Actualizar estado del equipo por serie
    await Equipo.findOneAndUpdate({ serie }, { estado }, { new: true });

    // 🔔 Ejecuta verificación (30 días por defecto)
    await verificarFechasMantenimiento(30);

    res.status(201).json({
      message: "Mantenimiento guardado y equipo actualizado correctamente",
      mantenimiento: nuevo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar mantenimiento" });
  }
};

// Obtener todos
export const mantenimientos = async (req, res) => {
  try {
    const lista = await Mantenimiento.find().sort({ fecha: -1 });
    res.json(lista);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener mantenimientos" });
  }
};

// Obtener por ID
export const obtenerMantenimientoPorId = async (req, res) => {
  try {
    const item = await Mantenimiento.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "No encontrado" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Eliminar
export const deleteMantenimientos = async (req, res) => {
  try {
    const eliminado = await Mantenimiento.findByIdAndDelete(req.params.id);
    if (!eliminado)
      return res.status(404).json({ message: "Mantenimiento no encontrado" });
    res.json({ message: "Mantenimiento eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar mantenimiento" });
  }
};

// Actualizar
export const actualizarMantenimiento = async (req, res) => {
  try {
    const actualizado = await Mantenimiento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!actualizado)
      return res.status(404).json({ message: "Mantenimiento no encontrado" });

    // 🔔 Ejecuta verificación tras actualizar
    await verificarFechasMantenimiento(30);

    res.json({
      message: "Mantenimiento actualizado correctamente",
      data: actualizado,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar mantenimiento" });
  }
};

// Obtener mantenimientos por serie
export const obtenerMantenimientosPorSerie = async (req, res) => {
  const { serie } = req.params;
  try {
    const lista = await Mantenimiento.find({ serie }).sort({ fecha: -1 });
    if (!lista || lista.length === 0) {
      return res.status(404).json({ message: "No hay mantenimientos para esta serie" });
    }
    res.json(lista);
  } catch (error) {
    console.error("Error al obtener mantenimientos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
