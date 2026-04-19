import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { PRODUCTS } from "../data/catalog";
import { formatMoney } from "../lib/format";

const featured = PRODUCTS.slice(0, 4);

export default function HomePage({ theme, setTheme }) {
  return (
    <div className="min-h-screen bg-gray-400 py-6 text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-checkout px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="rounded-3xl bg-white p-6 shadow-checkout dark:bg-gray-800 sm:p-8 lg:p-10">
          <SiteHeader theme={theme} setTheme={setTheme} />

          <section className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-ng-primary-200 bg-ng-primary-50 px-3 py-1 text-xs font-semibold text-ng-primary-800 dark:border-ng-primary-800 dark:bg-ng-primary-950/40 dark:text-ng-primary-300">
                <Sparkles className="size-3.5" aria-hidden />
                New season, Ethiopia-wide delivery
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl lg:text-5xl">
                Everyday goods, calm checkout
              </h1>
              <p className="max-w-xl text-base text-gray-600 dark:text-gray-400">
                Browse minimal home and lifestyle picks. Pay with Telebirr, CBE Birr,
                Amole, Awash Birr, or cash on delivery — all in ETB.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="inline-flex min-h-touch items-center justify-center gap-2 rounded-xl bg-ng-primary-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-ng-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ng-primary-500 focus-visible:ring-offset-2 active:scale-pressed dark:bg-ng-primary-500 dark:hover:bg-ng-primary-400 dark:focus-visible:ring-offset-gray-900"
                >
                  Shop now
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  to="/checkout"
                  className="inline-flex min-h-touch items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ng-primary-500 focus-visible:ring-offset-2 active:scale-pressed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus-visible:ring-offset-gray-900"
                >
                  Go to checkout
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-ng-primary-100/80 via-white to-ng-accent-100/60 p-8 dark:border-gray-700 dark:from-ng-primary-950/40 dark:via-gray-900 dark:to-ng-accent-950/30">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {featured.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-white/60 bg-white/70 p-3 shadow-sm backdrop-blur-sm dark:border-gray-600/60 dark:bg-gray-800/70"
                  >
                    <div
                      className={`mb-3 aspect-square w-full rounded-lg ${p.swatchClass} ring-1 ring-black/5 dark:ring-white/10`}
                      aria-hidden
                    />
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {p.name}
                    </p>
                    <p className="text-xs tabular-nums text-gray-600 dark:text-gray-400">
                      {formatMoney(p.unitPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
