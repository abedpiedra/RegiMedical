import { z } from "zod";

export const proveedorSchema = z.object({
  nombre_empresa: z.string({
    required_error: "Nombre is required",
  }),
  direccion: z.string({
    required_error: "apellido is required",
  }),
  telefono: z.string({
    required_error: "apellido is required",
  }),
  email: z
    .string()
    .email({
      required_error: "Email is required",
    })
    .email({
      message: " Invalid email",
    }),
});
