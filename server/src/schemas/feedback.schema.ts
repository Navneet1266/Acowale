import { z } from "zod";

export const FEEDBACK_CATEGORIES = [
  "Product",
  "Feature Request",
  "UI/UX",
  "Support",
  "Billing",
  "Other",
] as const;

export const FEEDBACK_STATUSES = ["open", "in_progress", "resolved"] as const;

export const createFeedbackSchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES, {
    errorMap: () => ({ message: `category must be one of ${FEEDBACK_CATEGORIES.join(", ")}` }),
  }),
  message: z.string().trim().min(3, "message must be at least 3 characters").max(2000),
  email: z.union([z.string().trim().email("email must be a valid email address"), z.literal("")]).optional(),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;

export const listFeedbackQuerySchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES).optional(),
  status: z.enum(FEEDBACK_STATUSES).optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type ListFeedbackQuery = z.infer<typeof listFeedbackQuerySchema>;

export const feedbackIdParamsSchema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
});

export type FeedbackIdParams = z.infer<typeof feedbackIdParamsSchema>;

export const updateFeedbackStatusSchema = z.object({
  status: z.enum(FEEDBACK_STATUSES, {
    errorMap: () => ({ message: `status must be one of ${FEEDBACK_STATUSES.join(", ")}` }),
  }),
});

export type UpdateFeedbackStatusInput = z.infer<typeof updateFeedbackStatusSchema>;
