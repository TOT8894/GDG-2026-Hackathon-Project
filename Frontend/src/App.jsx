import { useLayoutEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import OrdersPage from "./pages/OrdersPage";
import PaymentsPage from "./pages/PaymentsPage";
import RegisterPage from "./pages/RegisterPage";
import ShopPage from "./pages/ShopPage";
import TrackingPage from "./pages/TrackingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

export default function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light",
  );

  useLayoutEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage theme={theme} setTheme={setTheme} />}
      />
      <Route
        path="/shop"
        element={<ShopPage theme={theme} setTheme={setTheme} />}
      />
      <Route path="/shop/:id" 
      element={<ProductDetailPage />} />
      <Route
        path="/checkout"
        element={<CheckoutPage theme={theme} setTheme={setTheme} />}
      />
      <Route
        path="/login"
        element={<LoginPage theme={theme} setTheme={setTheme} />}
      />
      <Route
        path="/register"
        element={<RegisterPage theme={theme} setTheme={setTheme} />}
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetailPage theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <PaymentsPage theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        }
      />
        <Route
        path="/products"
        element={
          <ProtectedRoute>
            <OrdersPage theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="products/:id"
        element={
          <ProtectedRoute>
            <OrderDetailPage theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracking/:id"
        element={
          <ProtectedRoute>
            <TrackingPage theme={theme} setTheme={setTheme} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route
  path="/forgot-password"
  element={<ForgotPasswordPage />}
/>
    </Routes>
    
  );
}