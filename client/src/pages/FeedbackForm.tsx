import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { BarChart3, MessageSquareHeart, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { submitFeedback } from "../api/feedback";
import { ApiError } from "../api/client";
import { FEEDBACK_CATEGORIES } from "../api/types";

const VALUE_PROPS = [
  { icon: Zap, text: "Read by the team within a day, not a backlog" },
  { icon: BarChart3, text: "Every submission shapes what we build next" },
  { icon: ShieldCheck, text: "Anonymous by default — email is optional" },
];

export function FeedbackForm() {
  const [category, setCategory] = useState<string>("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!category) {
      setError("Please select a category.");
      return;
    }
    if (message.trim().length < 3) {
      setError("Please share a little more detail in your feedback.");
      return;
    }

    setStatus("submitting");
    try {
      await submitFeedback({ category, message: message.trim(), email: email.trim() || undefined });
      setStatus("success");
      setCategory("");
      setMessage("");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-fuchsia-700 p-12 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center font-bold">
              A
            </div>
            <span className="font-semibold tracking-tight">Acowale</span>
          </div>

          <h1 className="mt-16 text-5xl font-bold leading-[1.05] tracking-tight">
            Your voice
            <br />
            shapes what
            <br />
            we build.
          </h1>
          <p className="mt-5 text-lg text-white/80 max-w-sm">
            Two minutes of your time turns directly into our next roadmap decision.
          </p>
        </div>

        <div className="relative space-y-4">
          {VALUE_PROPS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-white/90">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Icon size={15} />
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">Acowale Feedback</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/5 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 sm:p-10">
            {status === "success" ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                  <MessageSquareHeart className="text-white" size={28} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
                  Thank you!
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Your feedback helps us improve Acowale for everyone.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="text-sm font-semibold text-violet-600 hover:text-violet-700"
                >
                  Submit more feedback
                </button>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 dark:bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                  <Sparkles size={12} /> We're listening
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-4 tracking-tight">
                  Share your feedback
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 mb-7">
                  Tell us what's working, what isn't, or what you wish existed.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow"
                    >
                      <option value="">Choose a category&hellip;</option>
                      {FEEDBACK_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Your feedback <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      maxLength={2000}
                      placeholder="Share your thoughts, suggestions, or issues..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none transition-shadow"
                    />
                    <div className="text-right text-xs text-slate-400 mt-1">{message.length}/2000</div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Your email <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow"
                    />
                    <p className="text-xs text-slate-400 mt-1.5">We'll never share your email.</p>
                  </div>

                  {error && (
                    <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg px-3 py-2">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-60 text-white font-semibold text-sm py-3 shadow-lg shadow-violet-600/25 transition-all"
                  >
                    {status === "submitting" ? "Submitting..." : "Submit Feedback"}
                  </button>
                </form>

                <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-6">
                  <ShieldCheck size={14} /> Your feedback is secure and anonymous.
                </p>
              </>
            )}
          </div>
          <p className="text-center text-xs text-slate-400 mt-5">
            <Link to="/admin/login" className="hover:text-slate-600 dark:hover:text-slate-300">
              Admin sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
