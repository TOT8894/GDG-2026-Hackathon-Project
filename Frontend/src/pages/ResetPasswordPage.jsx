import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authApi, ApiError } from "../lib/api";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setMessage("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setSubmitting(true);

        try {
            const response = await authApi.resetPassword({ token, newPassword });
            setMessage(response.message || "Password reset successfully. Please login with your new password.");
            setNewPassword("");
            setConfirmPassword("");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            const msg =
                err instanceof ApiError
                    ? err.message
                    : err?.message || "Failed to reset password";
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
                        Reset Password
                    </h1>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Enter your new password below.
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
                                htmlFor="new-password"
                                className="text-sm font-medium"
                            >
                                New Password
                            </label>

                            <input
                                id="new-password"
                                type="password"
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-900"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Must be at least 8 characters
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <label
                                htmlFor="confirm-password"
                                className="text-sm font-medium"
                            >
                                Confirm Password
                            </label>

                            <input
                                id="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-900"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-xl bg-ng-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-ng-primary-700 disabled:opacity-60 dark:bg-ng-primary-500 dark:hover:bg-ng-primary-400"
                        >
                            {submitting ? "Resetting..." : "Reset Password"}
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
