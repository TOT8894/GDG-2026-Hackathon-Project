import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../lib/api";

export default function VerifyEmailPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("verifying"); // verifying | success | error
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link.");
            return;
        }
        verifyEmail();
    }, [token]);

    async function verifyEmail() {
        try {
            const url = `/auth/verify-email/${token}`;
            const res = await apiRequest(url, { method: "GET", auth: false });
            setStatus("success");
            setMessage(res.message || "Email verified successfully!");
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setStatus("error");
            // Show more detailed error if available
            const errorMessage = err.body?.error || err.message || "Invalid or expired verification link.";
            setMessage(errorMessage);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8 dark:bg-gray-900">
            <div className="mx-auto max-w-md w-full px-4">
                <div className="rounded-3xl bg-white p-8 shadow-lg dark:bg-gray-800 text-center">
                    <h2 className="text-2xl font-bold text-indigo-600 mb-6">Kuralew Marketplace</h2>

                    {status === "verifying" && (
                        <div>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-300">Verifying your email...</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Email Verified!</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
                            <p className="text-sm text-gray-500">Redirecting to login...</p>
                        </div>
                    )}

                    {status === "error" && (
                        <div>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Verification Failed</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
                            {message.includes("Invalid or expired") && (
                                <p className="text-sm text-gray-500 mb-4">
                                    Please check your email for the correct link or request a new verification email.
                                </p>
                            )}
                            <Link
                                to="/login"
                                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                Go to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
