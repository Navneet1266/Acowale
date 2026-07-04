import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "../api/types";

interface TrendChartProps {
  data: TrendPoint[];
  height?: number;
  compact?: boolean;
}

function formatDate(dateStr: unknown): string {
  const d = new Date(`${String(dateStr)}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function withMovingAverage(data: TrendPoint[], windowSize = 7): Array<TrendPoint & { avg: number }> {
  return data.map((point, i) => {
    const windowStart = Math.max(0, i - windowSize + 1);
    const window = data.slice(windowStart, i + 1);
    const avg = window.reduce((sum, p) => sum + p.count, 0) / window.length;
    return { ...point, avg: Math.round(avg * 10) / 10 };
  });
}

export function TrendChart({ data, height = 220, compact = false }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm" style={{ height, color: "var(--adm-text-muted)" }}>
        {compact ? "No data yet" : "No submissions in the last 30 days yet."}
      </div>
    );
  }

  const chartData = compact ? data : withMovingAverage(data);

  return (
    <div>
      {!compact && (
        <div className="flex items-center gap-4 mb-2 text-xs" style={{ color: "var(--adm-text-secondary)" }}>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--adm-accent-2)" }} />
            Daily submissions
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: "var(--adm-warning)" }} />
            7-day average
          </span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={compact ? { top: 4, right: 0, bottom: 0, left: 0 } : { top: 4, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--adm-accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--adm-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          {!compact && <CartesianGrid vertical={false} stroke="var(--adm-gridline)" strokeDasharray="0" />}
          <XAxis
            dataKey="date"
            hide={compact}
            tickFormatter={formatDate}
            tickLine={false}
            axisLine={{ stroke: "var(--adm-baseline)" }}
            tick={{ fill: "var(--adm-text-muted)", fontSize: 11 }}
            minTickGap={24}
          />
          <YAxis hide={compact} allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--adm-text-muted)", fontSize: 11 }} />
          <Tooltip
            labelFormatter={formatDate}
            contentStyle={{
              background: "var(--adm-surface-solid)",
              border: "1px solid var(--adm-border-strong)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--adm-text-primary)",
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="Daily"
            stroke="var(--adm-accent-2)"
            strokeWidth={2}
            fill="url(#trendFill)"
          />
          {!compact && (
            <Line
              type="monotone"
              dataKey="avg"
              name="7-day average"
              stroke="var(--adm-warning)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              activeDot={{ r: 3 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
