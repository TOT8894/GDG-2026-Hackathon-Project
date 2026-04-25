import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    // Later connect backend API here
    setMessage("Password reset link has been sent to your email.");
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
            Enter your email and we’ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">

            {message && (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                {message}
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
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-900"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-ng-primary-600 py-3 text-sm font-semibold text-white hover:bg-ng-primary-700"
            >
              Send Reset Link
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-medium text-ng-primary-600 hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}