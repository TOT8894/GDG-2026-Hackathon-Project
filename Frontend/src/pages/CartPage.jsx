import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function CartPage({ theme, setTheme }) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
    const [updating, setUpdating] = useState({});

    if (!isAuthenticated) {
        navigate("/login");
        return null;
    }

    async function handleUpdateQuantity(listingId, newQuantity) {
        if (newQuantity < 1) return;

        setUpdating(prev => ({ ...prev, [listingId]: true }));
        try {
            await updateQuantity(listingId, newQuantity);
        } catch (err) {
            alert("Failed to update quantity");
        } finally {
            setUpdating(prev => ({ ...prev, [listingId]: false }));
        }
    }

    async function handleRemoveItem(listingId) {
        if (!confirm("Remove this item from your cart?")) return;

        try {
            await removeItem(listingId);
        } catch (err) {
            alert("Failed to remove item");
        }
    }

    async function handleClearCart() {
        if (!confirm("Clear all items from your cart?")) return;

        try {
            await clearCart();
        } catch (err) {
            alert("Failed to clear cart");
        }
    }

    function handleCheckout() {
        navigate("/checkout");
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <SiteHeader theme={theme} setTheme={setTheme} />
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SiteHeader theme={theme} setTheme={setTheme} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Shopping Cart
                    </h1>

                    {cart.items && cart.items.length > 0 && (
                        <button
                            onClick={handleClearCart}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

                {!cart.items || cart.items.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                            Your cart is empty
                        </div>
                        <Link
                            to="/marketplace"
                            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {cart.items.map((item) => (
                                        <div key={item.listingId._id} className="p-6">
                                            <div className="flex items-center gap-4">
                                                {/* Product Image */}
                                                <div className="flex-shrink-0">
                                                    {item.listingId.images && item.listingId.images.length > 0 ? (
                                                        <img
                                                            src={item.listingId.images[0]}
                                                            alt={item.listingId.title}
                                                            className="w-20 h-20 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                            <span className="text-gray-400 text-xs">No Image</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                        {item.listingId.title}
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                                                        {item.listingId.description}
                                                    </p>
                                                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                        {item.price} ETB each
                                                    </div>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.listingId._id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1 || updating[item.listingId._id]}
                                                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                        </svg>
                                                    </button>

                                                    <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.listingId._id, item.quantity + 1)}
                                                        disabled={updating[item.listingId._id]}
                                                        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Item Total */}
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {(item.price * item.quantity).toFixed(2)} ETB
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveItem(item.listingId._id)}
                                                        className="text-red-600 hover:text-red-800 text-sm mt-1"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Order Summary
                                </h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                        <span>Items ({cart.items.length})</span>
                                        <span>{cart.totalAmount.toFixed(2)} ETB</span>
                                    </div>

                                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                        <span>Shipping</span>
                                        <span>Free</span>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                                            <span>Total</span>
                                            <span>{cart.totalAmount.toFixed(2)} ETB</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium mb-4"
                                >
                                    Proceed to Checkout
                                </button>

                                <Link
                                    to="/marketplace"
                                    className="block text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}