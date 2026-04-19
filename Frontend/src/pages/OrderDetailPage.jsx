import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { ApiError, paymentId, paymentsApi } from "../lib/api";
import { formatMoney } from "../lib/format";

function pickAmount(p) {
  const n = Number(p?.amount ?? p?.total ?? p?.amountTotal ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export default function OrderDetailPage({ theme, setTheme }) {
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
            e instanceof ApiError ? e.message : e?.message || "Failed to load order",
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

  const pid = payment ? paymentId(payment) : id;

  return (
    <div className="min-h-screen bg-gray-400 py-6 text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:py-8">
      <div className="mx-auto w-full max-w-checkout px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-checkout dark:bg-gray-800 sm:p-8">
          <SiteHeader theme={theme} setTheme={setTheme} />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-xl font-semibold">Order details</h1>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/orders"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                All orders
              </Link>
              {pid ? (
                <Link
                  to={`/tracking/${pid}`}
                  className="rounded-lg bg-ng-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-ng-primary-700 dark:bg-ng-primary-500"
                >
                  Track shipment
                </Link>
              ) : null}
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Loaded with{" "}
            <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-700">
              GET /payments/:id
            </code>
          </p>

          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="mt-8 text-sm text-gray-500">Loading…</p>
          ) : !payment ? (
            <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
              Order not found.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Summary
                </h2>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Order ID</dt>
                    <dd className="font-medium tabular-nums">{pid}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Amount</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatMoney(pickAmount(payment))}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Status</dt>
                    <dd className="font-medium">
                      {payment.status ?? payment.paymentStatus ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Method</dt>
                    <dd className="font-medium">
                      {payment.method ??
                        payment.paymentMethod ??
                        payment.provider ??
                        "—"}
                    </dd>
                  </div>
                </dl>
              </section>
              <section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Raw payment fields
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Your API may return different keys — everything is shown below for
                  debugging.
                </p>
                <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                  {JSON.stringify(payment, null, 2)}
                </pre>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
