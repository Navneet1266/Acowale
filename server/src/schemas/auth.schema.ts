import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("email must be a valid email address"),
  password: z.string().min(1, "password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "current password is required"),
  newPassword: z.string().min(8, "new password must be at least 8 characters"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
