import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

export default function LoginPage({ theme, setTheme }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(from === "/login" ? "/" : from, { replace: true });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : err?.message || "Login failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-400 py-8 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-3xl bg-white p-8 shadow-checkout dark:bg-gray-800">
          <SiteHeader theme={theme} setTheme={setTheme} />
          <h1 className="mt-6 text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Use your account to pay and track orders.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            ) : null}
            <div className="grid gap-2">
              <label htmlFor="login-email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-900"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="login-password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-touch rounded-xl bg-ng-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-ng-primary-700 disabled:opacity-60 dark:bg-ng-primary-500 dark:hover:bg-ng-primary-400"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            No account?{" "}
            <Link
              to="/register"
              className="font-medium text-ng-primary-600 hover:underline dark:text-ng-primary-400"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
