import type { Queryable } from "../db/types";
import type { CreateFeedbackInput, ListFeedbackQuery } from "../schemas/feedback.schema";
import { AppError } from "../utils/AppError";

export interface FeedbackRow {
  id: string;
  category: string;
  message: string;
  email: string | null;
  status: string;
  created_at: string;
}

export async function createFeedback(db: Queryable, input: CreateFeedbackInput): Promise<FeedbackRow> {
  const { rows } = await db.query<FeedbackRow>(
    `INSERT INTO feedback (category, message, email)
     VALUES ($1, $2, $3)
     RETURNING id, category, message, email, status, created_at`,
    [input.category, input.message, input.email && input.email.length > 0 ? input.email : null],
  );
  return rows[0];
}

export interface ListFeedbackResult {
  items: FeedbackRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listFeedback(db: Queryable, query: ListFeedbackQuery): Promise<ListFeedbackResult> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (query.category) {
    params.push(query.category);
    conditions.push(`category = $${params.length}`);
  }
  if (query.status) {
    params.push(query.status);
    conditions.push(`status = $${params.length}`);
  }
  if (query.search) {
    params.push(`%${query.search}%`);
    conditions.push(`(message ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (query.page - 1) * query.pageSize;

  const countResult = await db.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM feedback ${whereClause}`,
    params,
  );
  const total = Number(countResult.rows[0]?.count ?? 0);

  const dataParams = [...params, query.pageSize, offset];
  const { rows } = await db.query<FeedbackRow>(
    `SELECT id, category, message, email, status, created_at
     FROM feedback
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams,
  );

  return { items: rows, total, page: query.page, pageSize: query.pageSize };
}

export async function updateFeedbackStatus(db: Queryable, id: string, status: string): Promise<FeedbackRow> {
  const { rows } = await db.query<FeedbackRow>(
    `UPDATE feedback SET status = $1 WHERE id = $2
     RETURNING id, category, message, email, status, created_at`,
    [status, id],
  );
  if (rows.length === 0) {
    throw AppError.notFound("Feedback not found", "FEEDBACK_NOT_FOUND");
  }
  return rows[0];
}

export interface Submitter {
  email: string;
  count: number;
  lastSubmittedAt: string;
}

export interface SubmittersResult {
  submitters: Submitter[];
  anonymousCount: number;
}

export async function listSubmitters(db: Queryable): Promise<SubmittersResult> {
  const { rows } = await db.query<{ email: string; count: string; last_submitted_at: string }>(
    `SELECT email, COUNT(*)::text AS count, MAX(created_at) AS last_submitted_at
     FROM feedback
     WHERE email IS NOT NULL
     GROUP BY email
     ORDER BY COUNT(*) DESC, last_submitted_at DESC
     LIMIT 50`,
  );

  const anonymousResult = await db.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM feedback WHERE email IS NULL",
  );

  return {
    submitters: rows.map((r) => ({ email: r.email, count: Number(r.count), lastSubmittedAt: r.last_submitted_at })),
    anonymousCount: Number(anonymousResult.rows[0]?.count ?? 0),
  };
}
