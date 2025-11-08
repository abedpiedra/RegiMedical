import { z } from "zod";

export const registerSchema = z.object({
  name: z.string({
    required_error: "name is required",
  }),
  apellido: z.string({
    required_error: "name is required",
  }),
  email: z
    .string()
    .email({
      required_error: "Email is required",
    })
    .email({
      message: " Invalid email",
    }),
  compania: z.string({
    required_error: "name is required",
  }),
  celular: z.string({
    required_error: "name is required",
  }),
  rol: z.string({
    required_error: "Rol is required",
  }),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, {
      message: "Password must be at least 6 characters",
    }),
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Email is not valid",
    }),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, {
      message: "Password Incorrect",
    }),
});
