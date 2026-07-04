import { Router } from "express";
import type { Response } from "express";
import { pool } from "../db/pool";
import { validate } from "../middleware/validate";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { feedbackSubmissionLimiter } from "../middleware/rateLimiter";
import {
  createFeedbackSchema,
  feedbackIdParamsSchema,
  listFeedbackQuerySchema,
  updateFeedbackStatusSchema,
  type FeedbackIdParams,
  type ListFeedbackQuery,
  type UpdateFeedbackStatusInput,
} from "../schemas/feedback.schema";
import { createFeedback, listFeedback, updateFeedbackStatus } from "../services/feedbackService";

export const feedbackRouter = Router();

feedbackRouter.post(
  "/",
  feedbackSubmissionLimiter,
  validate(createFeedbackSchema, "body"),
  async (req, res: Response, next) => {
    try {
      const feedback = await createFeedback(pool, req.body);
      res.status(201).json({ data: feedback });
    } catch (err) {
      next(err);
    }
  },
);

feedbackRouter.get(
  "/",
  requireAuth,
  validate(listFeedbackQuerySchema, "query"),
  async (req: AuthedRequest, res: Response, next) => {
    try {
      const result = await listFeedback(pool, req.validatedQuery as ListFeedbackQuery);
      res.json({ data: result.items, meta: { total: result.total, page: result.page, pageSize: result.pageSize } });
    } catch (err) {
      next(err);
    }
  },
);

feedbackRouter.patch(
  "/:id/status",
  requireAuth,
  validate(feedbackIdParamsSchema, "params"),
  validate(updateFeedbackStatusSchema, "body"),
  async (req: AuthedRequest, res: Response, next) => {
    try {
      const { id } = req.validatedParams as FeedbackIdParams;
      const { status } = req.body as UpdateFeedbackStatusInput;
      const feedback = await updateFeedbackStatus(pool, id, status);
      res.json({ data: feedback });
    } catch (err) {
      next(err);
    }
  },
);
