import { apiRequest } from "./client";
import type { AnalyticsSummary, Feedback, ListFeedbackResponse, SubmittersResponse } from "./types";

export interface SubmitFeedbackInput {
  category: string;
  message: string;
  email?: string;
}

export function submitFeedback(input: SubmitFeedbackInput): Promise<{ data: Feedback }> {
  return apiRequest("/api/feedback", { method: "POST", body: input });
}

export interface ListFeedbackParams {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function fetchFeedback(params: ListFeedbackParams, token: string): Promise<ListFeedbackResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const qs = query.toString();
  return apiRequest(`/api/feedback${qs ? `?${qs}` : ""}`, { token });
}

export function fetchAnalyticsSummary(token: string): Promise<{ data: AnalyticsSummary }> {
  return apiRequest("/api/analytics/summary", { token });
}

export function fetchSubmitters(token: string): Promise<{ data: SubmittersResponse }> {
  return apiRequest("/api/analytics/submitters", { token });
}

export function updateFeedbackStatus(id: string, status: string, token: string): Promise<{ data: Feedback }> {
  return apiRequest(`/api/feedback/${id}/status`, { method: "PATCH", body: { status }, token });
}

export function login(email: string, password: string): Promise<{ data: { token: string; email: string } }> {
  return apiRequest("/api/auth/login", { method: "POST", body: { email, password } });
}

export function changePassword(
  currentPassword: string,
  newPassword: string,
  token: string,
): Promise<{ data: { success: boolean } }> {
  return apiRequest("/api/auth/password", { method: "PATCH", body: { currentPassword, newPassword }, token });
}
