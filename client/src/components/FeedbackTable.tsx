import { FEEDBACK_STATUSES, type Feedback, type FeedbackStatus } from "../api/types";
import { CATEGORY_COLOR, STATUS_STYLE } from "../theme/categoryColors";

interface FeedbackTableProps {
  items: Feedback[];
  loading: boolean;
  onStatusChange?: (id: string, status: FeedbackStatus) => void;
  updatingId?: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function FeedbackTable({ items, loading, onStatusChange, updatingId }: FeedbackTableProps) {
  if (loading) {
    return <div className="py-10 text-center text-sm" style={{ color: "var(--adm-text-muted)" }}>Loading feedback...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="py-10 text-center text-sm" style={{ color: "var(--adm-text-muted)" }}>
        No feedback matches these filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs" style={{ color: "var(--adm-text-muted)", borderBottom: "1px solid var(--adm-border)" }}>
            <th className="py-2 pr-4 font-medium">Feedback</th>
            <th className="py-2 pr-4 font-medium">Category</th>
            <th className="py-2 pr-4 font-medium">User</th>
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const status = STATUS_STYLE[item.status];
            return (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--adm-gridline)" }}>
                <td className="py-3 pr-4 max-w-xs" style={{ color: "var(--adm-text-secondary)" }}>
                  <span className="line-clamp-2">{item.message}</span>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5" style={{ color: "var(--adm-text-secondary)" }}>
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLOR[item.category] }}
                    />
                    {item.category}
                  </span>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap" style={{ color: "var(--adm-text-muted)" }}>
                  {item.email ?? "Anonymous"}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap tabular-nums" style={{ color: "var(--adm-text-muted)" }}>
                  {formatDate(item.created_at)}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">
                  {onStatusChange ? (
                    <select
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(e) => onStatusChange(item.id, e.target.value as FeedbackStatus)}
                      className={`rounded-full border-0 pl-2.5 pr-7 py-0.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${status.className}`}
                    >
                      {FEEDBACK_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_STYLE[s].label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
