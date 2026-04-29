import { createContext, useContext, useState, useEffect } from "react";
import { cartApi, ApiError } from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCart({ items: [], totalAmount: 0 });
    }
  }, [isAuthenticated]);

  async function loadCart() {
    try {
      setLoading(true);
      const response = await cartApi.getCart();
      setCart(response.data || { items: [], totalAmount: 0 });
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(listingId, quantity = 1) {
    try {
      const response = await cartApi.addToCart({ listingId, quantity });
      setCart(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function updateQuantity(listingId, quantity) {
    try {
      const response = await cartApi.updateItem({ listingId, quantity });
      setCart(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function removeItem(listingId) {
    try {
      const response = await cartApi.removeItem(listingId);
      setCart(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function clearCart() {
    try {
      const response = await cartApi.clearCart();
      setCart(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    reloadCart: loadCart,
    itemCount: cart.items?.length || 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}