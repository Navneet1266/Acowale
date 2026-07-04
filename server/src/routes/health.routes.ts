import { Router } from "express";
import { checkDbConnection } from "../db/pool";

export const healthRouter = Router();

const startedAt = Date.now();

healthRouter.get("/", async (_req, res) => {
  const dbOk = await checkDbConnection();
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? "ok" : "degraded",
    db: dbOk ? "connected" : "unreachable",
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
});
