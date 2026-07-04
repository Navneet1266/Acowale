import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, Inbox, MessageSquareText, PieChart, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchAnalyticsSummary, fetchFeedback } from "../api/feedback";
import { ApiError } from "../api/client";
import type { AnalyticsSummary, Feedback } from "../api/types";
import { StatCard } from "../components/StatCard";
import { GlassCard } from "../components/GlassCard";
import { CategoryBarChart } from "../components/CategoryBarChart";
import { TrendChart } from "../components/TrendChart";
import { StatusDonutChart } from "../components/StatusDonutChart";
import { FilterBar } from "../components/FilterBar";
import { FeedbackTable } from "../components/FeedbackTable";
import { AdminLayout } from "../components/AdminLayout";
import { CATEGORY_COLOR } from "../theme/categoryColors";
import { useCountUp } from "../hooks/useCountUp";
import { Skeleton, SkeletonBars, SkeletonStatCard, SkeletonTableRows } from "../components/Skeleton";
import { SectionHeader } from "../components/SectionHeader";

const PAGE_SIZE = 10;

function computeWeekOverWeekDelta(trend: AnalyticsSummary["trend"]): number | undefined {
  if (trend.length === 0) return undefined;
  const byDate = new Map(trend.map((t) => [t.date, t.count]));
  const today = new Date();
  let last7 = 0;
  let prev7 = 0;
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = byDate.get(key) ?? 0;
    if (i < 7) last7 += count;
    else prev7 += count;
  }
  if (prev7 === 0) return last7 > 0 ? 100 : 0;
  return ((last7 - prev7) / prev7) * 100;
}

export function AdminDashboard() {
  const { token, logout } = useAuth();

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [items, setItems] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        if (err instanceof ApiError && err.status === 401) return logout();
        setError("Failed to load analytics summary.");
      });
  }, [token, logout]);

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
  }, [token, debouncedSearch, category, status, page, logout]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const openCount = summary?.statusBreakdown.find((s) => s.status === "open")?.count ?? 0;
  const inProgressCount = summary?.statusBreakdown.find((s) => s.status === "in_progress")?.count ?? 0;
  const resolvedCount = summary?.statusBreakdown.find((s) => s.status === "resolved")?.count ?? 0;

  const weekDelta = useMemo(() => (summary ? computeWeekOverWeekDelta(summary.trend) : undefined), [summary]);
  const topCategory = useMemo(() => {
    if (!summary || summary.totalFeedback === 0) return null;
    return [...summary.categoryBreakdown].sort((a, b) => b.count - a.count)[0];
  }, [summary]);

  const heroValue = useCountUp(summary ? summary.totalFeedback : null, 900);

  return (
    <AdminLayout title="Overview" subtitle="Real-time summary of customer feedback">
      {error && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(248,113,113,0.1)", color: "var(--adm-critical)" }}>
          {error}
        </p>
      )}

      {/* Bento row 1: hero + 2x2 stat grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <GlassCard glow="var(--adm-accent)" className="h-full flex flex-col justify-between min-h-[220px]">
            <div className="flex items-center gap-1.5 text-xs font-medium mb-1" style={{ color: "var(--adm-accent-2)" }}>
              <Sparkles size={13} /> All-time total
            </div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--adm-text-secondary)" }}>
              Total feedback
            </p>
            {summary ? (
              <>
                <p
                  className="text-6xl font-bold tracking-tight tabular-nums"
                  style={{ color: "var(--adm-text-primary)", textShadow: "0 0 32px rgba(99,102,241,0.3)" }}
                >
                  {heroValue}
                </p>
                {typeof weekDelta === "number" && (
                  <p
                    className="text-xs font-medium mt-2"
                    style={{ color: weekDelta > 0 ? "var(--adm-good)" : weekDelta < 0 ? "var(--adm-critical)" : "var(--adm-text-muted)" }}
                  >
                    {weekDelta > 0 ? "↑" : weekDelta < 0 ? "↓" : "–"} {Math.abs(weekDelta).toFixed(0)}% vs last week
                  </p>
                )}
                <div className="mt-3 -mx-1">
                  <TrendChart data={summary.trend} height={64} compact />
                </div>
              </>
            ) : (
              <>
                <Skeleton className="h-14 w-28 mb-2" />
                <Skeleton className="h-3 w-24 mb-4" />
                <Skeleton className="h-16 w-full" style={{ opacity: 0.4 }} />
              </>
            )}
          </GlassCard>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          {!summary ? (
            <>
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </>
          ) : (
            <>
              <StatCard label="Open" value={openCount} icon={<MessageSquareText size={19} />} accent="var(--adm-accent-2)" />
              <StatCard label="In progress" value={inProgressCount} icon={<Clock3 size={19} />} accent="var(--adm-warning)" />
              <StatCard label="Resolved" value={resolvedCount} icon={<CheckCircle2 size={19} />} accent="var(--adm-good)" />
              <GlassCard glow="var(--adm-accent)">
                <p className="text-xs font-medium mb-1.5" style={{ color: "var(--adm-text-secondary)" }}>
                  Top category
                </p>
                {topCategory ? (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLOR[topCategory.category] }} />
                    <span className="text-lg font-bold truncate" style={{ color: "var(--adm-text-primary)" }}>
                      {topCategory.category}
                    </span>
                  </div>
                ) : (
                  <p className="text-lg font-bold mt-1.5" style={{ color: "var(--adm-text-muted)" }}>
                    –
                  </p>
                )}
                {topCategory && (
                  <p className="text-xs mt-2" style={{ color: "var(--adm-text-muted)" }}>
                    {topCategory.percentage}% of all submissions
                  </p>
                )}
                <Inbox size={16} className="absolute right-4 top-4 opacity-40" style={{ color: "var(--adm-accent-2)" }} />
              </GlassCard>
            </>
          )}
        </div>
      </div>

      {/* Bento row 2: category + status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <GlassCard className="h-full">
            <SectionHeader
              icon={<BarChart3 size={15} />}
              title="Category distribution"
              subtitle="Submissions by category, all time"
              accent="var(--adm-accent-2)"
            />
            {summary ? <CategoryBarChart data={summary.categoryBreakdown} /> : <SkeletonBars rows={6} />}
          </GlassCard>
        </div>
        <div className="lg:col-span-5">
          <GlassCard className="h-full">
            <SectionHeader
              icon={<PieChart size={15} />}
              title="Status breakdown"
              subtitle="Where submissions are in the workflow"
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

      {/* Recent feedback */}
      <GlassCard>
        <SectionHeader
          icon={<Inbox size={15} />}
          title="Recent feedback"
          subtitle={`${total} total submissions`}
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
        {loading && items.length === 0 ? <SkeletonTableRows rows={6} /> : <FeedbackTable items={items} loading={false} />}

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
