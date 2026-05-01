import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi, ApiError } from "../lib/api";
import SiteHeader from "../components/SiteHeader";

export default function ChangePasswordPage({ theme, setTheme }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters");
            return;
        }

        if (currentPassword === newPassword) {
            setError("New password must be different from current password");
            return;
        }

        setSubmitting(true);

        try {
            await authApi.changePassword({ currentPassword, newPassword });

            // Password changed successfully, logout and redirect to login
            alert("Password changed successfully. Please login again with your new password.");
            await logout();
            navigate("/login");
        } catch (err) {
            const msg =
                err instanceof ApiError
                    ? err.message
                    : err?.message || "Failed to change password";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SiteHeader theme={theme} setTheme={setTheme} />

            <div className="mx-auto max-w-md px-4 py-8">
                <div className="rounded-3xl bg-white p-8 shadow-checkout dark:bg-gray-800">

                    <button
                        onClick={() => navigate("/profile")}
                        className="mb-4 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        ← Back to Profile
                    </button>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Change Password
                    </h1>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Enter your current password and choose a new one.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 grid gap-4">

                        {error && (
                            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                {error}
                            </p>
                        )}

                        <div className="grid gap-2">
                            <label
                                htmlFor="current-password"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Current Password
                            </label>
                            <input
                                id="current-password"
                                type="password"
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label
                                htmlFor="new-password"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
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
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Must be at least 8 characters
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <label
                                htmlFor="confirm-password"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Confirm New Password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-2 rounded-xl bg-ng-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-ng-primary-700 disabled:opacity-60 dark:bg-ng-primary-500 dark:hover:bg-ng-primary-400"
                        >
                            {submitting ? "Changing..." : "Change Password"}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}
