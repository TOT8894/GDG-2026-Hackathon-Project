import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { ApiError, paymentId, paymentsApi } from "../lib/api";
import { buildTrackingSteps } from "../lib/tracking";

export default function TrackingPage({ theme, setTheme }) {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const data = await paymentsApi.get(id);
        const p = data?.payment ?? data?.data ?? data;
        if (!cancelled) setPayment(p && typeof p === "object" ? p : null);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiError
              ? e.message
              : e?.message || "Failed to load tracking",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const steps = payment ? buildTrackingSteps(payment) : [];
  const pid = payment ? paymentId(payment) : id;

  return (
    <div className="min-h-screen bg-gray-400 py-6 text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:py-8">
      <div className="mx-auto w-full max-w-checkout px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-checkout dark:bg-gray-800 sm:p-8">
          <SiteHeader theme={theme} setTheme={setTheme} />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-xl font-semibold">Track order</h1>
            {pid ? (
              <Link
                to={`/orders/${pid}`}
                className="text-sm font-medium text-ng-primary-600 hover:underline dark:text-ng-primary-400"
              >
                Order details →
              </Link>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Status comes from your payment record (
            <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-700">
              GET /payments/:id
            </code>
            ). Steps are mapped locally for display until you add a dedicated
            tracking API.
          </p>

          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="mt-8 text-sm text-gray-500">Loading tracking…</p>
          ) : !payment ? (
            <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
              No tracking data for this ID.
            </p>
          ) : (
            <ol className="relative mt-8 border-s border-gray-200 dark:border-gray-600">
              {steps.map((step, i) => (
                <li key={step.id} className="mb-8 ms-6">
                  <span
                    className={
                      step.done
                        ? "absolute -start-3 flex size-6 items-center justify-center rounded-full bg-ng-accent-500 ring-4 ring-white dark:bg-ng-accent-500 dark:ring-gray-800"
                        : "absolute -start-3 flex size-6 items-center justify-center rounded-full bg-gray-200 ring-4 ring-white dark:bg-gray-600 dark:ring-gray-800"
                    }
                  >
                    {step.done ? (
                      <Check className="size-3.5 text-white" strokeWidth={3} aria-hidden />
                    ) : (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-300">
                        {i + 1}
                      </span>
                    )}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {step.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
