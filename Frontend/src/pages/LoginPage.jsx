import {  Moon,  Sun } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
      <div className="mb-4 flex items-center justify-between">
      <button
  onClick={() => navigate("/")}
  className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
>
  ← Back
</button>
 <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ng-primary-500 focus-visible:ring-offset-2 active:scale-pressed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:border-gray-500 dark:hover:bg-gray-600 dark:focus-visible:ring-offset-gray-800"
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        aria-pressed={theme === "dark"}
      >
        {theme === "dark" ? (
          <Sun className="size-5" aria-hidden />
        ) : (
          <Moon className="size-5" aria-hidden />
        )}
      </button>
</div>
      <h2 className="text-center text-2xl font-bold text-ng-primary-600">
  Kuralew Marketplace
</h2>
       

<h1 className="mt-4 text-xl font-semibold">Sign in</h1>
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
