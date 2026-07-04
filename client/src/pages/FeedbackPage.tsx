import { useEffect, useState } from "react";
import { BarChart3, Inbox, PieChart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchAnalyticsSummary, fetchFeedback, updateFeedbackStatus } from "../api/feedback";
import { ApiError } from "../api/client";
import type { AnalyticsSummary, Feedback, FeedbackStatus } from "../api/types";
import { FilterBar } from "../components/FilterBar";
import { FeedbackTable } from "../components/FeedbackTable";
import { AdminLayout } from "../components/AdminLayout";
import { GlassCard } from "../components/GlassCard";
import { CategoryBarChart } from "../components/CategoryBarChart";
import { StatusDonutChart } from "../components/StatusDonutChart";
import { Skeleton, SkeletonBars, SkeletonTableRows } from "../components/Skeleton";
import { SectionHeader } from "../components/SectionHeader";

const PAGE_SIZE = 15;

export function FeedbackPage() {
  const { token, logout } = useAuth();

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [items, setItems] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, status]);

  useEffect(() => {
    if (!token) return;
    fetchAnalyticsSummary(token)
      .then((res) => setSummary(res.data))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) logout();
      });
  }, [token, logout, refreshKey]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchFeedback({ search: debouncedSearch, category, status, page, pageSize: PAGE_SIZE }, token)
      .then((res) => {
        setItems(res.data);
        setTotal(res.meta.total);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) return logout();
        setError("Failed to load feedback.");
      })
      .finally(() => setLoading(false));
  }, [token, debouncedSearch, category, status, page, logout, refreshKey]);

  async function handleStatusChange(id: string, newStatus: FeedbackStatus) {
    if (!token) return;
    setUpdatingId(id);
    const previous = items;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
    try {
      await updateFeedbackStatus(id, newStatus, token);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setItems(previous);
      if (err instanceof ApiError && err.status === 401) return logout();
      setError("Failed to update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminLayout title="Feedback" subtitle="Triage and manage every submission">
      {error && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(248,113,113,0.1)", color: "var(--adm-critical)" }}>
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <GlassCard className="h-full">
            <SectionHeader
              icon={<BarChart3 size={15} />}
              title="By category"
              subtitle="All-time, for context while you triage"
              accent="var(--adm-accent-2)"
            />
            {summary ? <CategoryBarChart data={summary.categoryBreakdown} /> : <SkeletonBars rows={6} />}
          </GlassCard>
        </div>
        <div className="lg:col-span-5">
          <GlassCard className="h-full">
            <SectionHeader
              icon={<PieChart size={15} />}
              title="By status"
              subtitle="Updates live as you triage below"
              accent="var(--adm-good)"
            />
            {summary ? (
              <StatusDonutChart data={summary.statusBreakdown} height={140} />
            ) : (
              <div className="flex items-center gap-4">
                <Skeleton className="h-[140px] w-[140px] rounded-full shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      <GlassCard>
        <SectionHeader
          icon={<Inbox size={15} />}
          title="All feedback"
          subtitle={`${total} total submissions`}
          right={
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              className="text-xs font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--adm-accent-2)" }}
            >
              Refresh
            </button>
          }
        />
        <div className="mb-4">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            status={status}
            onStatusChange={setStatus}
          />
        </div>
        {loading && items.length === 0 ? (
          <SkeletonTableRows rows={8} />
        ) : (
          <FeedbackTable items={items} loading={false} onStatusChange={handleStatusChange} updatingId={updatingId} />
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg disabled:opacity-40 transition-colors"
              style={{ border: "1px solid var(--adm-border)", color: "var(--adm-text-secondary)" }}
            >
              Previous
            </button>
            <span style={{ color: "var(--adm-text-muted)" }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg disabled:opacity-40 transition-colors"
              style={{ border: "1px solid var(--adm-border)", color: "var(--adm-text-secondary)" }}
            >
              Next
            </button>
          </div>
        )}
      </GlassCard>
    </AdminLayout>
  );
}
