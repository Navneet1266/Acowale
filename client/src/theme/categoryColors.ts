import { FEEDBACK_CATEGORIES, type FeedbackCategory } from "../api/types";

const SERIES_VARS = [
  "var(--adm-series-1)",
  "var(--adm-series-2)",
  "var(--adm-series-3)",
  "var(--adm-series-4)",
  "var(--adm-series-5)",
  "var(--adm-series-6)",
];

export const CATEGORY_COLOR: Record<FeedbackCategory, string> = Object.fromEntries(
  FEEDBACK_CATEGORIES.map((category, i) => [category, SERIES_VARS[i]]),
) as Record<FeedbackCategory, string>;

export const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-white/[0.06] text-slate-300 ring-1 ring-white/10" },
  in_progress: { label: "In Progress", className: "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20" },
  resolved: { label: "Resolved", className: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20" },
};
