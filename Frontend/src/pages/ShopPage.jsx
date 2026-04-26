import { Check, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { useCart } from "../context/CartContext";
import { PRODUCTS } from "../data/catalog";
import { formatMoney } from "../lib/format";
import ProductDetailPage from "./ProductDetailPage";
export default function ShopPage({ theme, setTheme }) {
  const { addToCart, cart } = useCart();
  const [addedId, setAddedId] = useState(null);
  const addedTimeoutRef = useRef(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  function handleAdd(productId) {
    addToCart(productId, 1);
    setAddedId(productId);
    window.clearTimeout(addedTimeoutRef.current);
    addedTimeoutRef.current = window.setTimeout(() => setAddedId(null), 1600);
  }

  const inCartIds = new Set(cart.map((l) => l.id));
const filteredProducts = PRODUCTS.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.blurb.toLowerCase().includes(query.toLowerCase());

    const matchesCategory = category === "all" || p.category === category;

    return matchesQuery && matchesCategory;
  });
  return (
    <div className="min-h-screen bg-gray-400 py-6 text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-checkout px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="rounded-3xl bg-white p-6 shadow-checkout dark:bg-gray-800 sm:p-8 lg:p-10">
          <SiteHeader theme={theme} setTheme={setTheme} />

          <div className="mt-8 lg:mt-10">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Shop
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
              Add items to your cart — quantities sync on checkout. Prices in ETB.
            </p>
<div className="flex gap-4 mt-6">
  <input
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search products..."
    className="border p-2 rounded flex-1 bg-white text-black"
  />
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="border p-2 rounded bg-white text-black"
  >
    <option value="all">All Categories</option>
    <option value="electronics">Electronics</option>
    <option value="home">Home</option>
    <option value="kitchen">Kitchen</option>
  </select>
</div>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40 sm:p-5"
                >
                  <div
                    className={`mb-4 aspect-[4/3] w-full rounded-xl ${p.swatchClass} ring-1 ring-black/5 dark:ring-white/10`}
                    role="img"
                    aria-label={p.name}
                  />
                 <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
  <Link to={`/shop/${p.id}`} className="hover:underline">
    {p.name}
  </Link>
</h2>
                  <p className="mt-1 flex-1 text-sm text-gray-600 dark:text-gray-400">
                    {p.blurb}
                  </p>
                  <p className="mt-3 text-lg font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                    {formatMoney(p.unitPrice)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAdd(p.id)}
                    className="mt-4 inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-xl bg-ng-primary-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ng-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ng-primary-500 focus-visible:ring-offset-2 active:scale-pressed dark:bg-ng-primary-500 dark:hover:bg-ng-primary-400 dark:focus-visible:ring-offset-gray-900"
                  >
                    {addedId === p.id ? (
                      <>
                        <Check className="size-4" aria-hidden />
                        Added
                      </>
                    ) : inCartIds.has(p.id) ? (
                      <>
                        <Plus className="size-4" aria-hidden />
                        Add another
                      </>
                    ) : (
                      <>
                        <Plus className="size-4" aria-hidden />
                        Add to cart
                      </>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Ready?{" "}
              <Link
                to="/checkout"
                className="font-semibold text-ng-primary-600 underline-offset-2 hover:underline dark:text-ng-primary-400"
              >
                Continue to checkout
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
