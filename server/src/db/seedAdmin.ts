import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { pool } from "./pool";

async function seedAdmin(): Promise<void> {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    // eslint-disable-next-line no-console
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed an admin user.");
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);

  await pool.query(
    `INSERT INTO admin_users (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [env.ADMIN_EMAIL.toLowerCase(), passwordHash],
  );

  // eslint-disable-next-line no-console
  console.log(`Admin user ready: ${env.ADMIN_EMAIL}`);
  await pool.end();
}

seedAdmin().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to seed admin user:", err);
  process.exitCode = 1;
});
