export const FEEDBACK_CATEGORIES = [
  "Product",
  "Feature Request",
  "UI/UX",
  "Support",
  "Billing",
  "Other",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_STATUSES = ["open", "in_progress", "resolved"] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export interface Feedback {
  id: string;
  category: FeedbackCategory;
  message: string;
  email: string | null;
  status: FeedbackStatus;
  created_at: string;
}

export interface ListFeedbackResponse {
  data: Feedback[];
  meta: { total: number; page: number; pageSize: number };
}

export interface CategoryBreakdown {
  category: FeedbackCategory;
  count: number;
  percentage: number;
}

export interface StatusBreakdown {
  status: FeedbackStatus;
  count: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface AnalyticsSummary {
  totalFeedback: number;
  categoryBreakdown: CategoryBreakdown[];
  statusBreakdown: StatusBreakdown[];
  trend: TrendPoint[];
}

export interface Submitter {
  email: string;
  count: number;
  lastSubmittedAt: string;
}

export interface SubmittersResponse {
  submitters: Submitter[];
  anonymousCount: number;
}

export interface ApiErrorBody {
  error: { message: string; code: string };
}
