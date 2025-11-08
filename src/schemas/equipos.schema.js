// schemas/equipos.schema.ts
import { z } from "zod";

export const equipoSchema = z.object({
  serie: z.string({ required_error: "serie is required" }),
  modelo: z.string({ required_error: "modelo is required" }),
  marca: z.string({ required_error: "marca is required" }),
  area: z.string({ required_error: "area is required" }),
  estado: z.string({ required_error: "estado is required" }),
  umantencion: z.string().optional(),
  pmantencion: z.string().optional(),
  proveedor: z.string({ required_error: "proveedor is required" }),
  // Llegará como string si lo envías JSON.stringify(...) desde el front
  atributos_tecnicos: z.union([z.record(z.string()), z.string()]).optional(),
});
