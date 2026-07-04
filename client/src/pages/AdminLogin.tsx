import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

export function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden" style={{ background: "var(--adm-bg)" }}>
      <div className="adm-grid-texture pointer-events-none absolute inset-0 opacity-[0.25]" />
      <div className="pointer-events-none absolute -top-56 left-1/2 -translate-x-1/2 h-[36rem] w-[42rem] rounded-full opacity-[0.12] blur-[120px]" style={{ backgroundColor: "var(--adm-accent)" }} />

      <div className="relative w-full max-w-sm">
        <div
          className="rounded-2xl p-8 sm:p-9 backdrop-blur-xl"
          style={{ background: "var(--adm-surface)", border: "1px solid var(--adm-border-strong)", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
        >
          <div className="flex items-center gap-2 mb-8">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "var(--adm-accent)", boxShadow: "0 0 20px rgba(99,102,241,0.5)" }}
            >
              A
            </div>
            <span className="font-semibold tracking-tight" style={{ color: "var(--adm-text-primary)" }}>
              Acodash
            </span>
          </div>

          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "rgba(99,102,241,0.15)" }}
          >
            <LockKeyhole size={18} style={{ color: "var(--adm-accent-2)" }} />
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--adm-text-primary)" }}>
            Admin sign in
          </h1>
          <p className="text-sm mt-1 mb-7" style={{ color: "var(--adm-text-secondary)" }}>
            Sign in to view feedback analytics and manage submissions.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--adm-text-secondary)" }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
                style={{ background: "var(--adm-surface-solid)", border: "1px solid var(--adm-border)", color: "var(--adm-text-primary)" }}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--adm-text-secondary)" }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
                style={{ background: "var(--adm-surface-solid)", border: "1px solid var(--adm-border)", color: "var(--adm-text-primary)" }}
              />
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(248,113,113,0.1)", color: "var(--adm-critical)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl text-white font-semibold text-sm py-3 transition-all disabled:opacity-60"
              style={{ background: "var(--adm-accent)", boxShadow: "0 0 24px rgba(99,102,241,0.4)" }}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
