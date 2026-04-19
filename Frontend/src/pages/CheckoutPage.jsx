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
import { ApiError, paymentId, paymentsApi } from "../lib/api";
import { formatMoney } from "../lib/format";

const STEP_LABELS = [
  "Shipping Details",
  "Payment Method",
  "Confirmation",
];

/** Ethiopian mobile money & local checkout options */
const PAYMENT_METHODS = [
  {
    id: "telebirr",
    label: "Telebirr",
    sub: "Ethio Telecom wallet",
    icon: Smartphone,
  },
  {
    id: "cbebirr",
    label: "CBE Birr",
    sub: "Commercial Bank of Ethiopia",
    icon: Landmark,
  },
  {
    id: "amole",
    label: "Amole",
    sub: "Dashen Bank wallet",
    icon: Wallet,
  },
  {
    id: "awash",
    label: "Awash Birr",
    sub: "Awash Bank wallet",
    icon: Building2,
  },
  {
    id: "cod",
    label: "Cash on delivery",
    sub: "Pay when you receive your order",
    icon: Banknote,
  },
];

const MOBILE_MONEY_IDS = ["telebirr", "cbebirr", "amole", "awash"];

const WALLET_HINTS = {
  telebirr:
    "Use the mobile number registered in your Telebirr app. You may get an SMS code to confirm.",
  cbebirr:
    "Enter the phone number linked to CBE Birr. Confirm the payment in your CBE Birr app if prompted.",
  amole:
    "Use your Amole wallet phone number. Check Dashen Bank / Amole for OTP or in-app approval.",
  awash:
    "Use the number registered with Awash Birr. Complete confirmation in the Awash Birr app if asked.",
};

const inputBaseClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none ring-offset-2 transition placeholder:text-gray-400 focus-visible:border-ng-primary-500 focus-visible:ring-2 focus-visible:ring-ng-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:ring-offset-gray-900";

/** VAT-style levy (display only — adjust to your business rules) */
const TAX_RATE = 0.15;
/** Delivery in ETB */
const DELIVERY_FEE = 150;

function StepConnector({ filled }) {
  return (
    <div
      className="mx-1 h-px min-w-0 flex-1 md:mx-4 lg:mx-6"
      aria-hidden
    >
      <div
        className={
          filled
            ? "h-full rounded-full bg-ng-accent-500"
            : "h-full rounded-full bg-gray-200 dark:bg-gray-600"
        }
      />
    </div>
  );
}

function ProgressStepper({ activeIndex }) {
  return (
    <div
      className="flex w-full items-center justify-center"
      aria-label="Checkout progress"
    >
      {STEP_LABELS.map((label, index) => {
        const isComplete = index < activeIndex;
        const isActive = index === activeIndex;

        return (
          <div key={label} className="contents">
            {index > 0 ? (
              <StepConnector filled={index <= activeIndex} />
            ) : null}
            <div className="flex min-w-0 basis-0 flex-1 flex-col items-center gap-2 text-center">
              <div className="flex flex-col items-center gap-1">
                {isComplete ? (
                  <span className="flex size-9 items-center justify-center rounded-full bg-ng-accent-500 text-white shadow-sm ring-2 ring-ng-accent-500/20 dark:ring-ng-accent-400/30">
                    <Check className="size-4" strokeWidth={2.5} aria-hidden />
                    <span className="sr-only">{label}, completed</span>
                  </span>
                ) : isActive ? (
                  <span className="flex size-9 items-center justify-center rounded-full bg-ng-primary-500 text-sm font-semibold text-white shadow-md ring-4 ring-ng-primary-200 dark:bg-ng-primary-500 dark:ring-ng-primary-900/40">
                    {index + 1}
                    <span className="sr-only">
                      {label}, current step
                    </span>
                  </span>
                ) : (
                  <span className="flex size-9 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 text-sm font-medium text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500">
                    {index + 1}
                    <span className="sr-only">{label}, upcoming</span>
                  </span>
                )}
                <span
                  className={
                    isActive
                      ? "text-xs font-semibold text-ng-primary-600 dark:text-ng-primary-400 md:text-sm"
                      : isComplete
                        ? "text-xs font-medium text-gray-700 dark:text-gray-300 md:text-sm"
                        : "text-xs font-medium text-gray-400 dark:text-gray-500 md:text-sm"
                  }
                >
                  {label}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPage({ theme, setTheme }) {
  const { cart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("telebirr");
  const [saveInfo, setSaveInfo] = useState(false);
  const [promo, setPromo] = useState("");
  const [payError, setPayError] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const cartCount = useMemo(
    () => cart.reduce((n, line) => n + line.quantity, 0),
    [cart],
  );

  const { subtotal, tax, total } = useMemo(() => {
    const sub = cart.reduce(
      (sum, line) => sum + line.unitPrice * line.quantity,
      0,
    );
    const taxAmount = sub * TAX_RATE;
    return {
      subtotal: sub,
      tax: taxAmount,
      total: sub + taxAmount + DELIVERY_FEE,
    };
  }, [cart]);

  const activeStepIndex = 1;

  async function handlePay() {
    setPayError("");
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    if (cart.length === 0) {
      setPayError("Your cart is empty. Add items from the shop first.");
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
        lineItems: cart.map((line) => ({
          productId: line.id,
          name: line.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
        promoCode: promo.trim() || undefined,
        savePaymentInfo: saveInfo,
      };
      const res = await paymentsApi.create(payload);
      const created = res?.payment ?? res?.data ?? res;
      const id = paymentId(created);
      clearCart();
      if (id) navigate(`/orders/${id}`);
      else navigate("/orders");
    } catch (e) {
      setPayError(
        e instanceof ApiError ? e.message : e?.message || "Payment request failed",
      );
    } finally {
      setPayLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-400 py-6 text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-checkout px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="rounded-3xl bg-white p-6 shadow-checkout dark:bg-gray-800 sm:p-8 lg:p-10">
          <header className="flex flex-col gap-6 border-b border-gray-200 pb-6 dark:border-gray-700 md:gap-8">
            <SiteHeader theme={theme} setTheme={setTheme} />
            <ProgressStepper activeIndex={activeStepIndex} />
          </header>

          <div className="mt-6 flex flex-col gap-6 lg:mt-8 lg:grid lg:grid-cols-3 lg:items-start lg:gap-8 xl:gap-10">
            <section
              className="order-1 flex flex-col gap-6 lg:order-none lg:col-span-2"
              aria-labelledby="payment-heading"
            >
              <h1
                id="payment-heading"
                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                Pay with mobile money
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your Ethiopian wallet or bank app — like Telebirr, CBE Birr, Amole, or Awash
                Birr. Amounts are in ETB.
              </p>

              <fieldset className="space-y-3">
                <legend className="sr-only">Payment method</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PAYMENT_METHODS.map(({ id, label, sub, icon: Icon }) => {
                    const selected = paymentMethod === id;
                    return (
                      <label
                        key={id}
                        className={
                          selected
                            ? "flex cursor-pointer items-center gap-3 rounded-xl border-2 border-ng-primary-500 bg-ng-primary-50/60 p-4 shadow-sm transition-colors dark:border-ng-primary-500 dark:bg-ng-primary-950/30"
                            : "flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4 transition-colors hover:border-gray-300 dark:border-gray-600 dark:bg-gray-900/40 dark:hover:border-gray-500"
                        }
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={id}
                          checked={selected}
                          onChange={() => setPaymentMethod(id)}
                          className="sr-only"
                        />
                        <span
                          className={
                            selected
                              ? "flex size-10 shrink-0 items-center justify-center rounded-lg bg-ng-primary-500 text-white"
                              : "flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600"
                          }
                        >
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {label}
                          </span>
                          {sub ? (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {sub}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {MOBILE_MONEY_IDS.includes(paymentMethod) ? (
                <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-600 dark:bg-gray-900/30 sm:p-5">
                  <div
                    className="flex flex-wrap gap-2"
                    aria-label="Payment flow"
                  >
                    <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      +251
                    </span>
                    <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      OTP / SMS
                    </span>
                    <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      App confirm
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    {WALLET_HINTS[paymentMethod]}
                  </p>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label
                        htmlFor="wallet-phone"
                        className="text-sm font-medium text-gray-800 dark:text-gray-200"
                      >
                        Mobile number
                      </label>
                      <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm ring-offset-2 transition focus-within:border-ng-primary-500 focus-within:ring-2 focus-within:ring-ng-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900">
                        <span className="flex shrink-0 items-center border-r border-gray-200 px-3 text-sm font-medium text-gray-500 dark:border-gray-600 dark:text-gray-400">
                          +251
                        </span>
                        <input
                          id="wallet-phone"
                          name="wallet-phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          placeholder="9X XXX XXXX"
                          className="min-w-0 flex-1 rounded-r-lg border-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label
                          htmlFor="wallet-pin"
                          className="text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                          Wallet PIN
                        </label>
                        <input
                          id="wallet-pin"
                          name="wallet-pin"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="••••••"
                          className={inputBaseClass}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label
                          htmlFor="wallet-otp"
                          className="text-sm font-medium text-gray-800 dark:text-gray-200"
                        >
                          OTP (SMS)
                        </label>
                        <input
                          id="wallet-otp"
                          name="wallet-otp"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="6-digit code"
                          className={inputBaseClass}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label
                        htmlFor="account-name"
                        className="text-sm font-medium text-gray-800 dark:text-gray-200"
                      >
                        Account holder name
                      </label>
                      <input
                        id="account-name"
                        name="account-name"
                        autoComplete="name"
                        placeholder="Full name on wallet / bank record"
                        className={inputBaseClass}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {paymentMethod === "cod" ? (
                <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-600 dark:bg-gray-900/30 sm:p-5">
                  <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    Pay in cash when the delivery arrives. We will use your phone
                    number to coordinate drop-off (Addis Ababa &amp; major towns).
                  </p>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label
                        htmlFor="cod-name"
                        className="text-sm font-medium text-gray-800 dark:text-gray-200"
                      >
                        Recipient name
                      </label>
                      <input
                        id="cod-name"
                        name="cod-name"
                        autoComplete="name"
                        placeholder="Name for delivery"
                        className={inputBaseClass}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label
                        htmlFor="cod-phone"
                        className="text-sm font-medium text-gray-800 dark:text-gray-200"
                      >
                        Contact mobile
                      </label>
                      <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm ring-offset-2 transition focus-within:border-ng-primary-500 focus-within:ring-2 focus-within:ring-ng-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900">
                        <span className="flex shrink-0 items-center border-r border-gray-200 px-3 text-sm font-medium text-gray-500 dark:border-gray-600 dark:text-gray-400">
                          +251
                        </span>
                        <input
                          id="cod-phone"
                          name="cod-phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          placeholder="9X XXX XXXX"
                          className="min-w-0 flex-1 rounded-r-lg border-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex items-start gap-3 rounded-xl border border-transparent bg-transparent p-1">
                <input
                  id="save-info"
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="mt-1 size-4 rounded border-gray-300 text-ng-primary-600 focus:ring-ng-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900"
                />
                <label
                  htmlFor="save-info"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Save my information for a faster checkout
                </label>
              </div>

              <button
                type="button"
                className="w-full min-h-touch rounded-xl bg-ng-primary-600 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-ng-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ng-primary-500 focus-visible:ring-offset-2 active:scale-pressed dark:bg-ng-primary-500 dark:hover:bg-ng-primary-400 dark:focus-visible:ring-offset-gray-900"
              >
                ክፍያ / Pay&nbsp;&nbsp;|&nbsp;&nbsp;{formatMoney(total)}
              </button>
            </section>

            <aside className="order-2 flex flex-col gap-6 lg:order-none lg:col-span-1">
              <section
                className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40 sm:p-5"
                aria-labelledby="cart-heading"
              >
                <h2
                  id="cart-heading"
                  className="text-base font-semibold text-gray-900 dark:text-gray-100"
                >
                  Your Cart ({cartCount})
                </h2>
                <ul className="mt-4 space-y-4">
                  {cart.map((line) => (
                    <li
                      key={line.id}
                      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3"
                    >
                      <div
                        className={`size-14 shrink-0 overflow-hidden rounded-md ${line.swatchClass} ring-1 ring-black/5 dark:ring-white/10`}
                        role="img"
                        aria-label={`${line.name} thumbnail`}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {line.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-600 dark:bg-gray-800">
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.id, -1)}
                          className="flex size-8 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ng-primary-500 dark:text-gray-300 dark:hover:bg-gray-700"
                          aria-label={`Decrease quantity for ${line.name}`}
                        >
                          <Minus className="size-4" aria-hidden />
                        </button>
                        <span className="min-w-[2ch] text-center text-sm font-medium tabular-nums text-gray-900 dark:text-gray-100">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.id, 1)}
                          className="flex size-8 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ng-primary-500 dark:text-gray-300 dark:hover:bg-gray-700"
                          aria-label={`Increase quantity for ${line.name}`}
                        >
                          <Plus className="size-4" aria-hidden />
                        </button>
                      </div>
                      <p className="text-right text-sm font-medium tabular-nums text-gray-900 dark:text-gray-100">
                        {formatMoney(line.unitPrice * line.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>

              <section
                className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40 sm:p-5"
                aria-labelledby="promo-heading"
              >
                <h2
                  id="promo-heading"
                  className="text-base font-semibold text-gray-900 dark:text-gray-100"
                >
                  Promo Code of Gift Card
                </h2>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                  <input
                    id="promo-input"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Enter number"
                    className="min-h-touch w-full flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none ring-offset-2 transition placeholder:text-gray-400 focus-visible:border-ng-primary-500 focus-visible:ring-2 focus-visible:ring-ng-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:ring-offset-gray-900 sm:min-h-0"
                  />
                  <button
                    type="button"
                    className="inline-flex min-h-touch shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ng-primary-500 focus-visible:ring-offset-2 active:scale-pressed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus-visible:ring-offset-gray-900 sm:min-h-0"
                  >
                    Apply
                  </button>
                </div>
              </section>

              <section
                className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40 sm:p-5"
                aria-labelledby="summary-heading"
              >
                <h2
                  id="summary-heading"
                  className="text-base font-semibold text-gray-900 dark:text-gray-100"
                >
                  Summary
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-gray-600 dark:text-gray-400">Subtotal</dt>
                    <dd className="tabular-nums text-gray-900 dark:text-gray-100">
                      {formatMoney(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-gray-600 dark:text-gray-400">Tax</dt>
                    <dd className="tabular-nums text-gray-900 dark:text-gray-100">
                      {formatMoney(tax)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-gray-600 dark:text-gray-400">Delivery</dt>
                    <dd className="tabular-nums text-gray-900 dark:text-gray-100">
                      {formatMoney(DELIVERY_FEE)}
                    </dd>
                  </div>
                  <div className="border-t border-dashed border-gray-200 pt-3 dark:border-gray-600" />
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Total
                    </dt>
                    <dd className="text-base font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                      {formatMoney(total)}
                    </dd>
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
