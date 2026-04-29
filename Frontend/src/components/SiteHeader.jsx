import { LogOut, Moon, ShoppingBag, Sun, User, MessageCircle, ShoppingCart, LayoutDashboard } from "lucide-react";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import NotificationBell from "./NotificationBell";

const BRAND_NAME = "Kuralew";

const navClass = ({ isActive }) =>
  [
    "rounded-lg px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-ng-primary-100 text-ng-primary-800 dark:bg-ng-primary-950/50 dark:text-ng-primary-300"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100",
  ].join(" ");

export default function SiteHeader({ theme, setTheme }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, itemCount } = useCart();
  const cartCount = useMemo(
    () => itemCount || 0,
    [itemCount],
  );

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4 sm:gap-6">
        <NavLink
          to="/"
          className="flex min-w-0 items-center gap-3 text-gray-900 no-underline dark:text-gray-100"
        >
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ng-primary-500 text-white shadow-sm ring-2 ring-ng-primary-500/15 dark:ring-ng-primary-400/20"
            aria-hidden
          >
            <ShoppingBag className="size-5" strokeWidth={2.25} />
          </div>
          <span className="truncate text-base font-semibold tracking-tight md:text-lg">
            {BRAND_NAME}
          </span>
        </NavLink>
        <nav
          className="flex flex-wrap items-center gap-1"
          aria-label="Main navigation"
        >
          <NavLink to="/" className={navClass} end>
            Home
          </NavLink>
          <NavLink to="/marketplace" className={navClass}>
            <LayoutDashboard className="inline size-4 mr-1" aria-hidden /> Marketplace
          </NavLink>
          <NavLink to="/shop" className={navClass}>
            Shop
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/cart" className={navClass}>
              <ShoppingCart className="inline size-4 mr-1" aria-hidden /> Cart
              {cartCount > 0 ? (
                <span className="ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-ng-accent-500 px-1.5 text-xs font-semibold text-white tabular-nums">
                  {cartCount}
                </span>
              ) : null}
            </NavLink>
          )}
          <NavLink to="/checkout" className={navClass}>
            Checkout
          </NavLink>
          <NavLink to="/orders" className={navClass}>
            Orders
          </NavLink>
          <NavLink to="/payments" className={navClass}>
            Payments
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/chat" className={navClass}>
                <MessageCircle className="inline size-4" aria-hidden /> Chat
              </NavLink>
              {user?.role === 'seller' && (
                <NavLink to="/seller-dashboard" className={navClass}>
                  <LayoutDashboard className="inline size-4" aria-hidden /> Dashboard
                </NavLink>
              )}
              {user?.role === 'admin' && (
                <NavLink to="/admin" className={navClass}>
                  <LayoutDashboard className="inline size-4" aria-hidden /> Admin
                </NavLink>
              )}
              <NavLink to="/profile" className={navClass}>
                <User className="inline size-4" aria-hidden /> Profile
              </NavLink>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
              >
                <LogOut className="size-4" aria-hidden />
                <span className="max-w-[8rem] truncate sm:max-w-[12rem]">
                  {user?.email ? `Out (${user.email})` : "Log out"}
                </span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navClass}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        {isAuthenticated && <NotificationBell />}
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ng-primary-500 focus-visible:ring-offset-2 active:scale-pressed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:border-gray-500 dark:hover:bg-gray-600 dark:focus-visible:ring-offset-gray-800"
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          aria-pressed={theme === "dark"}
        >
          {theme === "dark" ? (
            <Sun className="size-5" aria-hidden />
          ) : (
            <Moon className="size-5" aria-hidden />
          )}
        </button>
      </div>
    </header>
  );
}
