import { z } from "zod";

// Schema for auth forms
export const signUpSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long").max(30),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(30),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(30),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(30),
  email: z.email("Invalid email address"),
  role: z.enum(["user", "admin", "owner"]),
});
