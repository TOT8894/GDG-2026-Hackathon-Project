import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

export default function RegisterPage({ theme, setTheme }) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({ name, email, password });
      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err?.message || "Registration failed";
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
          <h1 className="mt-6 text-xl font-semibold">Create account</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Register to save payments and view order history.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            ) : null}
            <div className="grid gap-2">
              <label htmlFor="reg-name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-900"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="reg-email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-900"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="reg-password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-touch rounded-xl bg-ng-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-ng-primary-700 disabled:opacity-60 dark:bg-ng-primary-500 dark:hover:bg-ng-primary-400"
            >
              {submitting ? "Creating…" : "Create account"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-ng-primary-600 hover:underline dark:text-ng-primary-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
