import { Router } from "express";
import { pool } from "../db/pool";
import { requireAuth } from "../middleware/auth";
import { getAnalyticsSummary } from "../services/analyticsService";
import { listSubmitters } from "../services/feedbackService";

export const analyticsRouter = Router();

analyticsRouter.get("/summary", requireAuth, async (_req, res, next) => {
  try {
    const summary = await getAnalyticsSummary(pool);
    res.json({ data: summary });
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get("/submitters", requireAuth, async (_req, res, next) => {
  try {
    const result = await listSubmitters(pool);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});
