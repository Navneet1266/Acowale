import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Queryable } from "../db/types";
import type { ChangePasswordInput, LoginInput } from "../schemas/auth.schema";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

interface AdminUserRow {
  id: string;
  email: string;
  password_hash: string;
}

export async function login(db: Queryable, input: LoginInput): Promise<{ token: string; email: string }> {
  const { rows } = await db.query<AdminUserRow>(
    "SELECT id, email, password_hash FROM admin_users WHERE email = $1",
    [input.email.toLowerCase()],
  );
  const admin = rows[0];

  if (!admin) {
    throw AppError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(input.password, admin.password_hash);
  if (!passwordMatches) {
    throw AppError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const token = jwt.sign({ sub: admin.id, email: admin.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);

  return { token, email: admin.email };
}

export async function changePassword(db: Queryable, adminId: string, input: ChangePasswordInput): Promise<void> {
  const { rows } = await db.query<AdminUserRow>("SELECT id, email, password_hash FROM admin_users WHERE id = $1", [
    adminId,
  ]);
  const admin = rows[0];
  if (!admin) {
    throw AppError.unauthorized("Admin account not found", "INVALID_CREDENTIALS");
  }

  const currentMatches = await bcrypt.compare(input.currentPassword, admin.password_hash);
  if (!currentMatches) {
    throw AppError.badRequest("Current password is incorrect", "INVALID_CURRENT_PASSWORD");
  }

  const newHash = await bcrypt.hash(input.newPassword, 10);
  await db.query("UPDATE admin_users SET password_hash = $1 WHERE id = $2", [newHash, admin.id]);
}
