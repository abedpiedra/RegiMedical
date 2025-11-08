import { Router } from "express";
import Equipo from "../models/equipos.model.js";
import Proveedor from "../models/proveedors.model.js";
import Mantenimiento from "../models/mantenimientos.model.js";

const router = Router();

/**
 * GET /api/search?q=term&limit=5
 * Busca por texto en múltiples colecciones y devuelve hits por tipo.
 */
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const limit = Math.min(parseInt(req.query.limit || "5"), 20);
    if (!q) return res.json({ equipos: [], proveedores: [], mantenimientos: [] });

    // Búsqueda “fuzzy” con regex (simple y efectiva)
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const [equipos, proveedores, mantenimientos] = await Promise.all([
      Equipo.find({
        $or: [
          { serie: rx },
          { modelo: rx },
          { marca: rx },
          { area: rx },
          { estado: rx },
          { proveedor: rx },
        ],
      })
        .select("_id serie modelo marca area estado proveedor")
        .limit(limit)
        .lean(),

      Proveedor.find({
        $or: [{ nombre_empresa: rx }, { rut: rx }, { contacto: rx }],
      })
        .select("_id nombre_empresa rut contacto")
        .limit(limit)
        .lean(),

      Mantenimiento.find({
        $or: [{ serie: rx }, { tipo: rx }, { responsable: rx }, { observaciones: rx }],
      })
        .select("_id serie tipo responsable fecha")
        .limit(limit)
        .lean(),
    ]);

    res.json({ equipos, proveedores, mantenimientos });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error en búsqueda" });
  }
});

export default router;
