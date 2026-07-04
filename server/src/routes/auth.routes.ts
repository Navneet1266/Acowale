import { Router } from "express";
import { pool } from "../db/pool";
import { validate } from "../middleware/validate";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { loginLimiter } from "../middleware/rateLimiter";
import { changePasswordSchema, loginSchema } from "../schemas/auth.schema";
import { changePassword, login } from "../services/authService";

export const authRouter = Router();

authRouter.post("/login", loginLimiter, validate(loginSchema, "body"), async (req, res, next) => {
  try {
    const result = await login(pool, req.body);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

authRouter.patch(
  "/password",
  requireAuth,
  validate(changePasswordSchema, "body"),
  async (req: AuthedRequest, res, next) => {
    try {
      await changePassword(pool, req.admin!.id, req.body);
      res.json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  },
);
