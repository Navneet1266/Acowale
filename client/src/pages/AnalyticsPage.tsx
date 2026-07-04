import { useEffect, useState } from "react";
import { BarChart3, CalendarDays, LayoutList, PieChart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchAnalyticsSummary } from "../api/feedback";
import { ApiError } from "../api/client";
import type { AnalyticsSummary } from "../api/types";
import { AdminLayout } from "../components/AdminLayout";
import { GlassCard } from "../components/GlassCard";
import { CategoryBarChart } from "../components/CategoryBarChart";
import { TrendHeatmap } from "../components/TrendHeatmap";
import { StatusDonutChart } from "../components/StatusDonutChart";
import { CATEGORY_COLOR } from "../theme/categoryColors";
import { Skeleton, SkeletonBars, SkeletonTableRows } from "../components/Skeleton";
import { SectionHeader } from "../components/SectionHeader";

export function AnalyticsPage() {
  const { token, logout } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchAnalyticsSummary(token)
      .then((res) => setSummary(res.data))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) return logout();
        setError("Failed to load analytics summary.");
      });
  }, [token, logout]);

  return (
    <AdminLayout title="Analytics" subtitle="A closer look at where feedback comes from and how it moves">
      {error && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(248,113,113,0.1)", color: "var(--adm-critical)" }}>
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard>
          <SectionHeader
            icon={<BarChart3 size={15} />}
            title="Category distribution"
            subtitle="Submissions by category, all time"
            accent="var(--adm-accent-2)"
          />
          {summary ? <CategoryBarChart data={summary.categoryBreakdown} /> : <SkeletonBars rows={6} />}
        </GlassCard>

        <GlassCard>
          <SectionHeader
            icon={<PieChart size={15} />}
            title="Status breakdown"
            subtitle="Where submissions are in the workflow"
            accent="var(--adm-good)"
          />
          {summary ? (
            <StatusDonutChart data={summary.statusBreakdown} />
          ) : (
            <div className="flex items-center gap-4">
              <Skeleton className="h-[200px] w-[200px] rounded-full shrink-0" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard>
        <SectionHeader
          icon={<CalendarDays size={15} />}
          title="Feedback trend"
          subtitle="Last 30 days, daily submission activity"
          accent="var(--adm-warning)"
        />
        {summary ? (
          <TrendHeatmap data={summary.trend} />
        ) : (
          <Skeleton className="h-[100px] w-full" style={{ opacity: 0.4 }} />
        )}
      </GlassCard>

      <GlassCard>
        <SectionHeader icon={<LayoutList size={15} />} title="Category breakdown" accent="var(--adm-accent)" />
        {summary ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs" style={{ color: "var(--adm-text-muted)", borderBottom: "1px solid var(--adm-border)" }}>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">Submissions</th>
                  <th className="py-2 pr-4 font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {[...summary.categoryBreakdown]
                  .sort((a, b) => b.count - a.count)
                  .map((c) => (
                    <tr key={c.category} style={{ borderBottom: "1px solid var(--adm-gridline)" }}>
                      <td className="py-2.5 pr-4" style={{ color: "var(--adm-text-secondary)" }}>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLOR[c.category] }} />
                          {c.category}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums" style={{ color: "var(--adm-text-secondary)" }}>{c.count}</td>
                      <td className="py-2.5 pr-4 tabular-nums" style={{ color: "var(--adm-text-muted)" }}>{c.percentage}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <SkeletonTableRows rows={6} />
        )}
      </GlassCard>
    </AdminLayout>
  );
}
