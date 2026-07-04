import { useState, type FormEvent } from "react";
import { KeyRound, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../api/feedback";
import { ApiError } from "../api/client";
import { AdminLayout } from "../components/AdminLayout";
import { GlassCard } from "../components/GlassCard";
import { SectionHeader } from "../components/SectionHeader";

const inputClass = "w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow";
const inputStyle = { background: "var(--adm-surface-solid)", border: "1px solid var(--adm-border)", color: "var(--adm-text-primary)" };

export function SettingsPage() {
  const { token, email, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (!token) return;

    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword, token);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return logout();
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminLayout title="Settings" subtitle="Manage your admin account">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard className="h-fit" glow="var(--adm-accent)" accent="var(--adm-accent-2)">
          <SectionHeader icon={<Mail size={15} />} title="Account" subtitle="Your admin sign-in details" accent="var(--adm-accent-2)" />
          <div className="rounded-xl px-3.5 py-2.5 text-sm" style={{ background: "var(--adm-surface-solid)", color: "var(--adm-text-secondary)" }}>
            {email}
          </div>
        </GlassCard>

        <GlassCard glow="var(--adm-accent)" accent="var(--adm-accent)">
          <SectionHeader
            icon={<KeyRound size={15} />}
            title="Change password"
            subtitle="Choose a password you're not using elsewhere"
            accent="var(--adm-accent)"
          />

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--adm-text-secondary)" }}>
                Current password
              </label>
              <input
                id="currentPassword"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--adm-text-secondary)" }}>
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--adm-text-secondary)" }}>
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(248,113,113,0.1)", color: "var(--adm-critical)" }}>
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(34,197,94,0.1)", color: "var(--adm-good)" }}>
                Password updated successfully.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl text-white font-semibold text-sm py-2.5 transition-all disabled:opacity-60"
              style={{
                background: "var(--adm-accent)",
                boxShadow: "0 0 20px rgba(99,102,241,0.35)",
              }}
            >
              {submitting ? "Updating..." : "Update password"}
            </button>
          </form>
        </GlassCard>
      </div>
    </AdminLayout>
  );
}
