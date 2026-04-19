import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_CART_LINES, PRODUCTS } from "../data/catalog";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(DEFAULT_CART_LINES);

  const addToCart = useCallback((productId, amount = 1) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;
    setCart((lines) => {
      const existing = lines.find((l) => l.id === productId);
      if (existing) {
        return lines.map((l) =>
          l.id === productId ? { ...l, quantity: l.quantity + amount } : l,
        );
      }
      return [
        ...lines,
        {
          id: product.id,
          name: product.name,
          unitPrice: product.unitPrice,
          quantity: amount,
          swatchClass: product.swatchClass,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((id, delta) => {
    setCart((lines) =>
      lines.map((line) => {
        if (line.id !== id) return line;
        const next = Math.max(1, line.quantity + delta);
        return { ...line, quantity: next };
      }),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const value = useMemo(
    () => ({ cart, setCart, addToCart, updateQuantity, clearCart }),
    [cart, addToCart, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
