import type { Queryable } from "../db/types";
import { FEEDBACK_CATEGORIES, FEEDBACK_STATUSES } from "../schemas/feedback.schema";

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface StatusBreakdown {
  status: string;
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

export function buildCategoryBreakdown(
  counts: Array<{ category: string; count: number }>,
  total: number,
): CategoryBreakdown[] {
  const countMap = new Map(counts.map((c) => [c.category, c.count]));
  return FEEDBACK_CATEGORIES.map((category) => {
    const count = countMap.get(category) ?? 0;
    return {
      category,
      count,
      percentage: total === 0 ? 0 : Math.round((count / total) * 1000) / 10,
    };
  });
}

export function buildStatusBreakdown(counts: Array<{ status: string; count: number }>): StatusBreakdown[] {
  const countMap = new Map(counts.map((c) => [c.status, c.count]));
  return FEEDBACK_STATUSES.map((status) => ({ status, count: countMap.get(status) ?? 0 }));
}

export async function getAnalyticsSummary(db: Queryable): Promise<AnalyticsSummary> {
  // Run all four aggregates concurrently instead of sequentially — on a
  // cold serverless Postgres connection, each round trip pays the same
  // latency, so four awaits in series is ~4x slower than necessary.
  const [totalResult, categoryResult, statusResult, trendResult] = await Promise.all([
    db.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM feedback"),
    db.query<{ category: string; count: string }>(
      "SELECT category, COUNT(*)::text AS count FROM feedback GROUP BY category",
    ),
    db.query<{ status: string; count: string }>(
      "SELECT status, COUNT(*)::text AS count FROM feedback GROUP BY status",
    ),
    db.query<{ date: string; count: string }>(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date, COUNT(*)::text AS count
       FROM feedback
       WHERE created_at >= now() - interval '30 days'
       GROUP BY date
       ORDER BY date ASC`,
    ),
  ]);

  const totalFeedback = Number(totalResult.rows[0]?.count ?? 0);
  const categoryBreakdown = buildCategoryBreakdown(
    categoryResult.rows.map((r) => ({ category: r.category, count: Number(r.count) })),
    totalFeedback,
  );
  const statusBreakdown = buildStatusBreakdown(statusResult.rows.map((r) => ({ status: r.status, count: Number(r.count) })));
  const trend = trendResult.rows.map((r) => ({ date: r.date, count: Number(r.count) }));

  return { totalFeedback, categoryBreakdown, statusBreakdown, trend };
}
