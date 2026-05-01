import {
  Check,
  Minus,
  Plus,
  Wallet,
  Banknote,
  Smartphone,
  Landmark,
  Building2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ApiError, ordersApi, paymentsApi } from "../lib/api";
import { formatMoney } from "../lib/format";

const STEP_LABELS = ["Cart Review", "Payment Method", "Confirmation"];

const PAYMENT_METHODS = [
  { id: "telebirr", label: "Telebirr", sub: "Ethio Telecom wallet", icon: Smartphone },
  { id: "cbebirr", label: "CBE Birr", sub: "Commercial Bank of Ethiopia", icon: Landmark },
  { id: "amole", label: "Amole", sub: "Dashen Bank wallet", icon: Wallet },
  { id: "awash", label: "Awash Birr", sub: "Awash Bank wallet", icon: Building2 },
  { id: "cod", label: "Cash on delivery", sub: "Pay when you receive your order", icon: Banknote },
];

const MOBILE_MONEY_IDS = ["telebirr", "cbebirr", "amole", "awash"];

const WALLET_HINTS = {
  telebirr: "Use the mobile number registered in your Telebirr app. You may get an SMS code to confirm.",
  cbebirr: "Enter the phone number linked to CBE Birr. Confirm the payment in your CBE Birr app if prompted.",
  amole: "Use your Amole wallet phone number. Check Dashen Bank / Amole for OTP or in-app approval.",
  awash: "Use the number registered with Awash Birr. Complete confirmation in the Awash Birr app if asked.",
};

const inputBaseClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none ring-offset-2 transition placeholder:text-gray-400 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:ring-offset-gray-900";

const TAX_RATE = 0.15;
const DELIVERY_FEE = 150;

function StepConnector({ filled }) {
  return (
    <div className="mx-1 h-px min-w-0 flex-1 md:mx-4" aria-hidden>
      <div className={filled ? "h-full rounded-full bg-indigo-500" : "h-full rounded-full bg-gray-200 dark:bg-gray-600"} />
    </div>
  );
}

function ProgressStepper({ activeIndex }) {
  return (
    <div className="flex w-full items-center justify-center" aria-label="Checkout progress">
      {STEP_LABELS.map((label, index) => {
        const isComplete = index < activeIndex;
        const isActive = index === activeIndex;
        return (
          <div key={label} className="contents">
            {index > 0 ? <StepConnector filled={index <= activeIndex} /> : null}
            <div className="flex min-w-0 basis-0 flex-1 flex-col items-center gap-2 text-center">
              {isComplete ? (
                <span className="flex size-9 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm">
                  <Check className="size-4" strokeWidth={2.5} aria-hidden />
                </span>
              ) : isActive ? (
                <span className="flex size-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white shadow-md ring-4 ring-indigo-200 dark:ring-indigo-900/40">
                  {index + 1}
                </span>
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 text-sm font-medium text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500">
                  {index + 1}
                </span>
              )}
              <span className={isActive ? "text-xs font-semibold text-indigo-600 dark:text-indigo-400 md:text-sm" : isComplete ? "text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm" : "text-xs font-medium text-gray-400 dark:text-gray-500 md:text-sm"}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPage({ theme, setTheme }) {
  const { cart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("telebirr");
  const [walletPhone, setWalletPhone] = useState("");
  const [promo, setPromo] = useState("");
  const [payError, setPayError] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  // cart.items is the array from CartContext
  const cartItems = cart.items || [];

  const { subtotal, tax, total } = useMemo(() => {
    const sub = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxAmount = sub * TAX_RATE;
    return { subtotal: sub, tax: taxAmount, total: sub + taxAmount + DELIVERY_FEE };
  }, [cartItems]);

  async function handlePay() {
    setPayError("");
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    if (cartItems.length === 0) {
      setPayError("Your cart is empty. Add items from the marketplace first.");
      return;
    }
    if (!user?.isEmailVerified && MOBILE_MONEY_IDS.includes(paymentMethod)) {
      setPayError("Please verify your email before making a payment.");
      return;
    }
    setPayLoading(true);
    try {
      const payload = {
        amount: Math.round(total),
        currency: "ETB",
        paymentMethod,
        subtotal: Math.round(subtotal),
        tax: Math.round(tax),
        deliveryFee: DELIVERY_FEE,
        walletPhone: walletPhone || undefined,
        lineItems: cartItems.map((item) => ({
          listingId: item.listingId._id || item.listingId,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        promoCode: promo.trim() || undefined,
      };
      const res = await paymentsApi.create(payload);
      const created = res?.payment ?? res?.data ?? res;
      const pid = created?._id || created?.id || created?.paymentId;
      await clearCart();
      navigate(pid ? `/orders/${pid}` : "/orders");
    } catch (e) {
      setPayError(e instanceof ApiError ? e.message : e?.message || "Payment request failed");
    } finally {
      setPayLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-lg dark:bg-gray-800 sm:p-8 lg:p-10">
          <header className="flex flex-col gap-6 border-b border-gray-200 pb-6 dark:border-gray-700 md:gap-8">
            <SiteHeader theme={theme} setTheme={setTheme} />
            <ProgressStepper activeIndex={1} />
          </header>

          <div className="mt-6 flex flex-col gap-6 lg:mt-8 lg:grid lg:grid-cols-3 lg:items-start lg:gap-8">
            {/* Left: Payment */}
            <section className="flex flex-col gap-6 lg:col-span-2">
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Pay with mobile money
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Choose your Ethiopian wallet — Telebirr, CBE Birr, Amole, or Awash Birr. Amounts in ETB.
                </p>
              </div>

              {/* Email verification notice */}
              {!user?.isEmailVerified && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                  ⚠️ Your email is not verified. Verify your email to enable mobile money payments.
                </div>
              )}

              <fieldset className="space-y-3">
                <legend className="sr-only">Payment method</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PAYMENT_METHODS.map(({ id, label, sub, icon: Icon }) => {
                    const selected = paymentMethod === id;
                    return (
                      <label
                        key={id}
                        className={selected
                          ? "flex cursor-pointer items-center gap-3 rounded-xl border-2 border-indigo-500 bg-indigo-50/60 p-4 shadow-sm dark:border-indigo-500 dark:bg-indigo-950/30"
                          : "flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4 transition hover:border-gray-300 dark:border-gray-600 dark:bg-gray-900/40 dark:hover:border-gray-500"}
                      >
                        <input type="radio" name="payment" value={id} checked={selected} onChange={() => setPaymentMethod(id)} className="sr-only" />
                        <span className={selected ? "flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white" : "flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600"}>
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
                          {sub && <span className="text-xs text-gray-500 dark:text-gray-400">{sub}</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {MOBILE_MONEY_IDS.includes(paymentMethod) && (
                <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-600 dark:bg-gray-900/30 sm:p-5">
                  <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    {WALLET_HINTS[paymentMethod]}
                  </p>
                  <div className="grid gap-2">
                    <label htmlFor="wallet-phone" className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Mobile number
                    </label>
                    <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800">
                      <span className="flex shrink-0 items-center border-r border-gray-200 px-3 text-sm font-medium text-gray-500 dark:border-gray-600 dark:text-gray-400">+251</span>
                      <input
                        id="wallet-phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder="9X XXX XXXX"
                        value={walletPhone}
                        onChange={(e) => setWalletPhone(e.target.value)}
                        className="min-w-0 flex-1 rounded-r-lg border-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "cod" && (
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-600 dark:bg-gray-900/30">
                  <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    Pay in cash when the delivery arrives. We will use your phone number to coordinate drop-off.
                  </p>
                </div>
              )}

              {payError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                  {payError}
                </p>
              )}

              <button
                type="button"
                onClick={handlePay}
                disabled={payLoading || cartItems.length === 0}
                className="w-full rounded-xl bg-indigo-600 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                {payLoading ? "Processing..." : `ክፍያ / Pay  |  ${formatMoney(total)}`}
              </button>
            </section>

            {/* Right: Cart Summary */}
            <aside className="flex flex-col gap-6 lg:col-span-1">
              <section className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40 sm:p-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Your Cart ({cartItems.length} items)
                </h2>
                {cartItems.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-500">Cart is empty.</p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {cartItems.map((item) => {
                      const listing = item.listingId;
                      const title = typeof listing === "object" ? listing.title : "Product";
                      const image = typeof listing === "object" ? listing.images?.[0] : null;
                      return (
                        <li key={item._id || item.listingId} className="flex items-center gap-3">
                          <div className="size-14 shrink-0 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700">
                            {image ? (
                              <img src={image} alt={title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No img</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
                            <p className="text-xs text-gray-500">x{item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium tabular-nums text-gray-900 dark:text-gray-100">
                            {formatMoney(item.price * item.quantity)}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40 sm:p-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Promo Code</h2>
                <div className="mt-4 flex gap-2">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <button type="button" className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700">
                    Apply
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40 sm:p-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Summary</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-600 dark:text-gray-400">Subtotal</dt>
                    <dd className="tabular-nums">{formatMoney(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-600 dark:text-gray-400">Tax (15%)</dt>
                    <dd className="tabular-nums">{formatMoney(tax)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-600 dark:text-gray-400">Delivery</dt>
                    <dd className="tabular-nums">{formatMoney(DELIVERY_FEE)}</dd>
                  </div>
                  <div className="border-t border-dashed border-gray-200 pt-3 dark:border-gray-600" />
                  <div className="flex justify-between gap-4">
                    <dt className="text-base font-semibold text-gray-900 dark:text-gray-100">Total</dt>
                    <dd className="text-base font-semibold tabular-nums text-gray-900 dark:text-gray-100">{formatMoney(total)}</dd>
                  </div>
                </dl>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
