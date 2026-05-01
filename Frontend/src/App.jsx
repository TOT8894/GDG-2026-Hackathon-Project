import { useLayoutEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";

// Marketplace
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/MarketplacePage";
import ListingDetailPage from "./pages/ListingDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";

// Seller
import SellerDashboardPage from "./pages/SellerDashboardPage";
import CreateListingPage from "./pages/CreateListingPage";

// Orders & Payments
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import PaymentsPage from "./pages/PaymentsPage";

// Chat
import ChatPage from "./pages/ChatPage";

// Admin
import AdminDashboardPage from "./pages/AdminDashboardPage";

export default function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useLayoutEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const tp = { theme, setTheme };

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage {...tp} />} />
      <Route path="/marketplace" element={<MarketplacePage {...tp} />} />
      <Route path="/listing/:id" element={<ListingDetailPage {...tp} />} />
      <Route path="/login" element={<LoginPage {...tp} />} />
      <Route path="/register" element={<RegisterPage {...tp} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      {/* Protected — any logged-in user */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage {...tp} /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage {...tp} /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><CartPage {...tp} /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage {...tp} /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage {...tp} /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage {...tp} /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><PaymentsPage {...tp} /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage {...tp} /></ProtectedRoute>} />

      {/* Seller */}
      <Route path="/seller-dashboard" element={<ProtectedRoute><SellerDashboardPage {...tp} /></ProtectedRoute>} />
      <Route path="/create-listing" element={<ProtectedRoute><CreateListingPage {...tp} /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage {...tp} /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
