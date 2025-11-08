// controllers/equipos.controller.js
import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import AdmZip from "adm-zip";
import Equipo from "../models/equipos.model.js";
import { createAccessToken } from "../libs/jwt.js";
import {
  upsertNotificacionMantenimientoEquipo,
  parseFechaFlexible,
} from "./mantenimientos.controller.js";

const FOTOS_DIR = path.join(process.cwd(), "Equipos_Fotos");
const safeUnlink = (absPath) => {
  try {
    if (absPath && fs.existsSync(absPath)) fs.unlinkSync(absPath);
  } catch {}
};

// ============ Crear ============ //
export const equipo = async (req, res) => {
  try {
    let {
      serie,
      modelo,
      marca,
      area,
      estado,
      umantencion,
      pmantencion,
      proveedor,
      atributos_tecnicos,
    } = req.body;

    if (typeof atributos_tecnicos === "string" && atributos_tecnicos.trim()) {
      try {
        atributos_tecnicos = JSON.parse(atributos_tecnicos);
      } catch {}
    }

    const equipoFound = await Equipo.findOne({ serie, proveedor });
    if (equipoFound)
      return res.status(400).json(["El equipo ya está en uso"]);

    let foto_path, foto_mime, foto_size;
    if (req.file) {
      foto_path = `/Equipos_Fotos/${req.file.filename}`;
      foto_mime = req.file.mimetype;
      foto_size = req.file.size;
    }

    const newEquipo = new Equipo({
      serie,
      modelo,
      marca,
      area,
      estado,
      umantencion,
      pmantencion,
      proveedor,
      atributos_tecnicos,
      foto_path,
      foto_mime,
      foto_size,
    });

    // Guardar equipo
    const equipoSaved = await newEquipo.save();
    const token = await createAccessToken({ id: equipoSaved._id });
    res.cookie("token", token);

    // 🔔 Verificar si debe generar notificación inmediata
    try {
      await upsertNotificacionMantenimientoEquipo(equipoSaved, 30);
    } catch (e) {
      console.warn("No se pudo generar notificación de mantenimiento (create):", e.message);
    }

    res.json(equipoSaved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ Listar ============ //
export const equipos = async (_req, res) => {
  try {
    const list = await Equipo.find();
    res.json(list);
  } catch {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// ============ Obtener por ID ============ //
export const obtenerEquipoPorId = async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id);
    if (!equipo)
      return res.status(404).json({ message: "Equipo no encontrado" });
    res.json(equipo);
  } catch {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ============ Eliminar ============ //
export const deleteEquipos = async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params._id);
    if (!equipo)
      return res.status(404).json({ message: "Equipo no encontrado" });

    if (equipo.foto_path) {
      const abs = path.join(process.cwd(), equipo.foto_path);
      safeUnlink(abs);
    }

    await Equipo.deleteOne({ _id: req.params._id });
    res.json({ message: "Equipo eliminado correctamente" });
  } catch {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// ============ Actualizar (sin foto) ============ //
export const actualizarEquipo = async (req, res) => {
  const { id } = req.params;
  let {
    serie,
    modelo,
    marca,
    area,
    estado,
    umantencion,
    pmantencion,
    proveedor,
    atributos_tecnicos,
  } = req.body;

  if (typeof atributos_tecnicos === "string" && atributos_tecnicos.trim()) {
    try {
      atributos_tecnicos = JSON.parse(atributos_tecnicos);
    } catch {}
  }

  try {
    const updated = await Equipo.findByIdAndUpdate(
      id,
      {
        serie,
        modelo,
        marca,
        area,
        estado,
        umantencion,
        pmantencion,
        proveedor,
        atributos_tecnicos,
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Equipo no encontrado" });

    // 🔔 Verificar si la actualización requiere nueva notificación
    try {
      await upsertNotificacionMantenimientoEquipo(updated, 30);
    } catch (e) {
      console.warn("No se pudo generar notificación de mantenimiento (update):", e.message);
    }

    res.json({
      message: "Equipo actualizado correctamente",
      data: updated,
    });
  } catch {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ============ Actualizar SOLO foto ============ //
export const actualizarFotoEquipo = async (req, res) => {
  const { id } = req.params;
  if (!req.file)
    return res.status(400).json({ message: "No se adjuntó imagen" });

  try {
    const equipo = await Equipo.findById(id);
    if (!equipo)
      return res.status(404).json({ message: "Equipo no encontrado" });

    if (equipo.foto_path) {
      const abs = path.join(process.cwd(), equipo.foto_path);
      safeUnlink(abs);
    }

    equipo.foto_path = `/Equipos_Fotos/${req.file.filename}`;
    equipo.foto_mime = req.file.mimetype;
    equipo.foto_size = req.file.size;
    await equipo.save();

    res.json({ message: "Foto actualizada", data: equipo });
  } catch {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ============ Importar Excel + ZIP de imágenes ============ //
export const importarEquipos = async (req, res) => {
  try {
    if (!req.files?.excel?.[0]) {
      return res.status(400).json({ message: "Falta el Excel" });
    }

    // Descomprimir imágenes (opcional)
    const zipBuf = req.files?.imagenes_zip?.[0]?.buffer;
    let zipMap = new Map(); // nombre-lower => ruta /Equipos_Fotos/xxx
    if (zipBuf) {
      if (!fs.existsSync(FOTOS_DIR)) fs.mkdirSync(FOTOS_DIR, { recursive: true });
      const zip = new AdmZip(zipBuf);
      for (const e of zip.getEntries()) {
        if (e.isDirectory) continue;
        const base = path.basename(e.entryName);
        const dest = path.join(FOTOS_DIR, base);
        fs.writeFileSync(dest, e.getData());
        zipMap.set(base.toLowerCase(), `/Equipos_Fotos/${base}`);
      }
    }

    // Parse Excel
    const wb = XLSX.read(req.files.excel[0].buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

    let insertados = 0,
      actualizados = 0,
      errores = [];

    for (const r of rows) {
      const serie = String(r["Serie"] || "").trim();
      if (!serie) continue;

      const doc = {
        serie,
        modelo: String(r["Modelo"] || ""),
        marca: String(r["Marca"] || ""),
        area: String(r["Área"] || r["Area"] || ""),
        estado: String(r["Estado"] || "activo"),
        umantencion: String(r["Última Mantención"] || r["Ultima Mantención"] || ""),
        pmantencion: String(r["Próxima Mantención"] || r["Proxima Mantención"] || ""),
        proveedor: String(r["Proveedor"] || ""),
      };

      // atributos técnicos con prefijo AT:
      const atributos = {};
      Object.keys(r).forEach((k) => {
        if (k.startsWith("AT:")) atributos[k.slice(3)] = String(r[k] ?? "");
      });
      if (Object.keys(atributos).length) doc.atributos_tecnicos = atributos;

      // foto_archivo (o varias separadas por ;)
      const nombreFoto = String(r["foto_archivo"] || r["fotos_archivos"] || "").trim();
      if (nombreFoto) {
        const archivos = nombreFoto
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);
        const match = archivos.find((a) => zipMap.has(a.toLowerCase()));
        if (match) doc.foto_path = zipMap.get(match.toLowerCase());
      }

      try {
        const updated = await Equipo.findOneAndUpdate(
          { serie, proveedor: doc.proveedor },
          { $set: doc },
          { upsert: true, new: true }
        );

        // 🔔 Generar notificación para cada equipo importado
        await upsertNotificacionMantenimientoEquipo(updated, 30);

        if (updated.createdAt?.toString() === updated.updatedAt?.toString())
          insertados++;
        else actualizados++;
      } catch (e) {
        errores.push({ serie, error: e.message });
      }
    }

    res.json({ ok: true, insertados, actualizados, errores });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Error procesando importación",
      error: e.message,
    });
  }
};
