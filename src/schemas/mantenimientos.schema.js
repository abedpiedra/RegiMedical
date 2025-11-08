import { z } from "zod";

export const mantenimientoSchema = z.object({
  fecha: z.string({
    required_error: "La fecha de mantenimiento es obligatoria",
  }),
  serie: z.string({
    required_error: "La serie es obligatoria",
  }),
  lugar: z.string({
    required_error: "La serie es obligatoria",
  }),
  tipo: z.string({
    required_error: "El tipo de mantenimiento es obligatorio",
  }),
  responsable: z.string({
    required_error: "El técnico responsable es obligatorio",
  }),
  estado: z.string({
    required_error: "El estado del equipo es obligatorio",
  }),
  observaciones: z.string({
    required_error: "Observaciones del equipo es obligatorio",
  }),
  parametros_operacionales: z.record(z.string()).optional().default({}),
});
