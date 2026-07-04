import { useEffect, useState } from "react";
import { BarChart3, ListOrdered, Users as UsersIcon, UserX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchSubmitters } from "../api/feedback";
import { ApiError } from "../api/client";
import type { SubmittersResponse } from "../api/types";
import { AdminLayout } from "../components/AdminLayout";
import { GlassCard } from "../components/GlassCard";
import { StatCard } from "../components/StatCard";
import { SubmitterBarChart } from "../components/SubmitterBarChart";
import { SkeletonBars, SkeletonStatCard, SkeletonTableRows } from "../components/Skeleton";
import { SectionHeader } from "../components/SectionHeader";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function UsersPage() {
  const { token, logout } = useAuth();
  const [data, setData] = useState<SubmittersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchSubmitters(token)
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) return logout();
        setError("Failed to load submitters.");
      });
  }, [token, logout]);

  return (
    <AdminLayout title="Users" subtitle="Everyone who has left their email with feedback">
      {error && (
        <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(248,113,113,0.1)", color: "var(--adm-critical)" }}>
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {!data ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <StatCard
              label="Identified submitters"
              value={data.submitters.length}
              icon={<UsersIcon size={20} />}
              accent="var(--adm-accent)"
            />
            <StatCard
              label="Anonymous submissions"
              value={data.anonymousCount}
              icon={<UserX size={20} />}
              accent="var(--adm-text-muted)"
            />
          </>
        )}
      </div>

      {(!data || data.submitters.length > 0) && (
        <GlassCard>
          <SectionHeader
            icon={<BarChart3 size={15} />}
            title="Submissions by submitter"
            subtitle={`Top ${data ? Math.min(data.submitters.length, 8) : "8"} by volume`}
            accent="var(--adm-accent-2)"
          />
          {data ? <SubmitterBarChart submitters={data.submitters} /> : <SkeletonBars rows={5} />}
        </GlassCard>
      )}

      <GlassCard>
        <SectionHeader
          icon={<ListOrdered size={15} />}
          title="Top submitters"
          subtitle="Ranked by number of submissions"
          accent="var(--adm-accent)"
        />

        {!data ? (
          <SkeletonTableRows rows={5} />
        ) : data.submitters.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: "var(--adm-text-muted)" }}>
            No one has left an email with their feedback yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs" style={{ color: "var(--adm-text-muted)", borderBottom: "1px solid var(--adm-border)" }}>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Submissions</th>
                  <th className="py-2 pr-4 font-medium">Last submitted</th>
                </tr>
              </thead>
              <tbody>
                {data.submitters.map((s) => (
                  <tr key={s.email} style={{ borderBottom: "1px solid var(--adm-gridline)" }}>
                    <td className="py-2.5 pr-4" style={{ color: "var(--adm-text-secondary)" }}>{s.email}</td>
                    <td className="py-2.5 pr-4 tabular-nums" style={{ color: "var(--adm-text-secondary)" }}>{s.count}</td>
                    <td className="py-2.5 pr-4 tabular-nums" style={{ color: "var(--adm-text-muted)" }}>
                      {formatDate(s.lastSubmittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </AdminLayout>
  );
}
