import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email({message: "Invalid email address."}),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." })
});

export const loginSchema = z.object({
  email: z.string().email({message: "Invalid email address."}),
  password: z.string().min(1, {message: "Please enter a password."})
});

export const emailConfirmationSchema = z.object({
  email: z.string().email({message: "Invalid email address."}),
});