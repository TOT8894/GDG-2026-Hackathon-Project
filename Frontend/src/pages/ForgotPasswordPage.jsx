import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, ApiError } from "../lib/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const response = await authApi.forgotPassword({ email });
      setMessage(response.message || "If an account exists with this email, a password reset link has been sent.");
      setEmail("");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err?.message || "Failed to send reset link";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-400 py-8 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-3xl bg-white p-8 shadow-checkout dark:bg-gray-800">


          <button
            onClick={() => navigate("/login")}
            className="mb-4 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            ← Back to Login
          </button>

          <h2 className="text-center text-2xl font-bold text-ng-primary-600">
            Kuralew Marketplace
          </h2>

          <h1 className="mt-4 text-xl font-semibold">
            Forgot Password
          </h1>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">

            {message && (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">
                {message}
              </p>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="grid gap-2">
              <label
                htmlFor="forgot-email"
                className="text-sm font-medium"
              >
                Email
              </label>

              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-ng-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-ng-primary-700 disabled:opacity-60 dark:bg-ng-primary-500 dark:hover:bg-ng-primary-400"
            >
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{" "}
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
