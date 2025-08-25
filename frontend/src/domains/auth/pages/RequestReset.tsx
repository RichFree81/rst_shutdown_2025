import { useState } from "react";
import { APP_NAME, APP_TAGLINE } from "@/theme/brand";

export default function RequestReset() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSubmit = email.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // TODO: call POST /api/v1/auth/password-reset
      throw new Error("Not implemented (scaffold)");
    } catch (err: any) {
      setError(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto h-10 w-10 rounded-full bg-brand-blue shadow-sm mb-3" aria-hidden></div>
          <h1 className="font-ui text-2xl font-bold text-brand-navy tracking-tight">{APP_NAME}</h1>
          {APP_TAGLINE && <p className="body-copy text-text-secondary mt-1">{APP_TAGLINE}</p>}
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-lg ring-1 ring-black/5">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block body-copy text-text-secondary mb-1">Email</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            {error && <p className="body-copy text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full px-4 py-2 rounded-xl bg-brand-blue bg-blue-600 text-white border border-blue-600 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
