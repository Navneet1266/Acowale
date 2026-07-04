import type { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`adm-skeleton rounded-md ${className}`}
      style={{ background: "var(--adm-gridline)", ...style }}
    />
  );
}

export function SkeletonStatCard() {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: "var(--adm-surface-solid)", borderColor: "var(--adm-border)" }}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-9 w-16 mb-3" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
      </div>
    </div>
  );
}

export function SkeletonBars({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3.5 py-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-3 w-24 shrink-0" />
          <Skeleton className="h-2.5 flex-1" style={{ opacity: 0.5 }} />
          <Skeleton className="h-3 w-14 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTableRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4 py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-20 shrink-0" />
          <Skeleton className="h-3 w-24 shrink-0" />
          <Skeleton className="h-3 w-16 shrink-0" />
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}
