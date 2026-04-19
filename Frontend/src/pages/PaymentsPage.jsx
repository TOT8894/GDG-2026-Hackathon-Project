import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { ApiError, normalizeList, paymentId, paymentsApi } from "../lib/api";
import { formatMoney } from "../lib/format";

function pickAmount(p) {
  const n = Number(p?.amount ?? p?.total ?? p?.amountTotal ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function pickStatus(p) {
  return p?.status ?? p?.paymentStatus ?? "—";
}

export default function PaymentsPage({ theme, setTheme }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const data = await paymentsApi.list();
        if (!cancelled) setItems(normalizeList(data));
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiError
              ? e.message
              : e?.message || "Failed to load payments",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-400 py-6 text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:py-8">
      <div className="mx-auto w-full max-w-checkout px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-checkout dark:bg-gray-800 sm:p-8">
          <SiteHeader theme={theme} setTheme={setTheme} />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Payments</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                History from{" "}
                <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-700">
                  GET /payments
                </code>
              </p>
            </div>
            <Link
              to="/checkout"
              className="rounded-xl bg-ng-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ng-primary-700 dark:bg-ng-primary-500 dark:hover:bg-ng-primary-400"
            >
              New checkout
            </Link>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="mt-8 text-sm text-gray-500">Loading payments…</p>
          ) : items.length === 0 ? (
            <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
              No payments yet.
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((p) => {
                const id = paymentId(p);
                return (
                  <li
                    key={id || JSON.stringify(p)}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Payment #{id || "—"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {pickStatus(p)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatMoney(pickAmount(p))}
                      </span>
                      <Link
                        to={`/orders/${id}`}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-700"
                      >
                        Receipt / details
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
