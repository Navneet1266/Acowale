import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const feedbackSubmissionLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_SUBMISSIONS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many submissions, please try again shortly.", code: "RATE_LIMITED" } },
});

export const loginLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_LOGIN,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many login attempts, please try again shortly.", code: "RATE_LIMITED" } },
});
