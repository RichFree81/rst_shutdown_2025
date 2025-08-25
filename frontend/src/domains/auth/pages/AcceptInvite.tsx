import { useState } from "react";
import { APP_NAME, APP_TAGLINE } from "@/theme/brand";

export default function AcceptInvite() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // TODO: call POST /api/v1/auth/accept-invite with token from URL
      throw new Error("Not implemented (scaffold)");
    } catch (err: any) {
      setError(err.message || "Accept failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto h-10 w-10 rounded-full bg-brand-blue mb-3" aria-hidden></div>
          <h1 className="font-ui text-2xl font-bold text-brand-navy">{APP_NAME}</h1>
          {APP_TAGLINE && <p className="body-copy text-text-secondary mt-1">{APP_TAGLINE}</p>}
        </div>
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="h2 text-brand-navy mb-4">Set your password</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block body-copy text-text-secondary mb-1">New password</label>
              <input className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="body-copy text-red-600">{error}</p>}
            <button disabled={loading} className="w-full px-4 py-2 rounded-xl bg-brand-blue text-white disabled:opacity-60">
              {loading ? "Saving..." : "Save password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
