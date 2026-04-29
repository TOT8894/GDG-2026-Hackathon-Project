import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listingsApi, chatApi } from "../lib/api";
import SiteHeader from "../components/SiteHeader";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Search, SlidersHorizontal, MessageCircle, ShoppingCart, MapPin, Tag } from "lucide-react";

const CATEGORIES = [
    "Electronics", "Clothing", "Home & Garden", "Sports",
    "Books", "Automotive", "Health & Beauty", "Toys & Games",
    "Food & Beverages", "Other",
];

const CONDITIONS = [
    { value: "", label: "Any condition" },
    { value: "new", label: "New" },
    { value: "used", label: "Used" },
    { value: "old", label: "Old" },
];

function Toast({ message, type = "success", onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 shadow-lg text-white text-sm font-medium transition-all ${type === "error" ? "bg-red-600" : "bg-green-600"}`}>
            {message}
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
    );
}

export default function MarketplacePage({ theme, setTheme }) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);
    const [addingToCart, setAddingToCart] = useState({});

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);

    const showToast = (message, type = "success") => setToast({ message, type });

    const loadListings = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (category) params.category = category;
            if (condition) params.condition = condition;
            if (sortBy) params.sort = sortBy;

            const response = await listingsApi.getAll(params);
            setListings(response.data || response || []);
        } catch (err) {
            setError("Failed to load listings. Is the backend running?");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, category, condition, sortBy]);

    useEffect(() => {
        const t = setTimeout(loadListings, 300); // debounce search
        return () => clearTimeout(t);
    }, [loadListings]);

    async function handleAddToCart(e, listingId) {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        setAddingToCart((prev) => ({ ...prev, [listingId]: true }));
        try {
            await addToCart(listingId, 1);
            showToast("Added to cart!");
        } catch (err) {
            showToast(err.message || "Failed to add to cart", "error");
        } finally {
            setAddingToCart((prev) => ({ ...prev, [listingId]: false }));
        }
    }

    const conditionBadge = (c) => {
        if (c === "new") return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
        if (c === "used") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SiteHeader theme={theme} setTheme={setTheme} />

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
                    <button
                        onClick={() => setShowFilters((v) => !v)}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <SlidersHorizontal className="size-4" />
                        Filters
                    </button>
                </div>

                {/* Search bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                </div>

                {/* Filters row */}
                {showFilters && (
                    <div className="mb-6 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="price-low">Price: Low → High</option>
                            <option value="price-high">Price: High → Low</option>
                        </select>

                        {(category || condition || sortBy !== "newest") && (
                            <button
                                onClick={() => { setCategory(""); setCondition(""); setSortBy("newest"); }}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* States */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="size-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                {!loading && !error && listings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Search className="size-14 mb-4 opacity-30" />
                        <p className="text-lg font-medium">No products found</p>
                        <p className="mt-1 text-sm">Try adjusting your search or filters</p>
                    </div>
                )}

                {/* Product grid */}
                {!loading && listings.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {listings.map((listing) => (
                            <div
                                key={listing._id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                            >
                                {/* Image */}
                                <Link to={`/listing/${listing._id}`} className="block">
                                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        {listing.images?.length > 0 ? (
                                            <img
                                                src={listing.images[0]}
                                                alt={listing.title}
                                                className="h-full w-full object-cover transition group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-400">
                                                <Tag className="size-10 opacity-30" />
                                            </div>
                                        )}
                                        {/* Condition badge */}
                                        {listing.condition && (
                                            <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${conditionBadge(listing.condition)}`}>
                                                {listing.condition}
                                            </span>
                                        )}
                                    </div>
                                </Link>

                                {/* Info */}
                                <div className="flex flex-1 flex-col p-4">
                                    <Link to={`/listing/${listing._id}`}>
                                        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">
                                            {listing.title}
                                        </h3>
                                    </Link>

                                    <p className="mb-2 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                                        {listing.description}
                                    </p>

                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                            {listing.price?.toLocaleString()} {listing.currency || "ETB"}
                                        </span>
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                            {listing.category}
                                        </span>
                                    </div>

                                    {/* Seller + location */}
                                    <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
                                        <div className="flex size-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold dark:bg-indigo-900/40 dark:text-indigo-400">
                                            {listing.sellerId?.fullName?.charAt(0) || "S"}
                                        </div>
                                        <span className="truncate">{listing.sellerId?.fullName || "Seller"}</span>
                                        {listing.location?.address && (
                                            <>
                                                <MapPin className="size-3 shrink-0" />
                                                <span className="truncate">{listing.location.address}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="mt-auto flex gap-2">
                                        <button
                                            onClick={(e) => handleAddToCart(e, listing._id)}
                                            disabled={addingToCart[listing._id]}
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                                        >
                                            <ShoppingCart className="size-3.5" />
                                            {addingToCart[listing._id] ? "Adding…" : "Add to Cart"}
                                        </button>

                                        <Link
                                            to={`/chat?userId=${listing.sellerId?._id || listing.sellerId || ""}`}
                                            onClick={(e) => {
                                                if (!isAuthenticated) {
                                                    e.preventDefault();
                                                    navigate("/login");
                                                    return;
                                                }
                                                const sid = listing.sellerId?._id || listing.sellerId;
                                                if (!sid) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                                // Send opening message in background
                                                chatApi.sendMessage({
                                                    receiverId: String(sid),
                                                    message: `Hi! I'm interested in your listing: "${listing.title}"`,
                                                }).catch(() => { });
                                            }}
                                            className="flex items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
                                        >
                                            <MessageCircle className="size-3.5" />
                                            Chat
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
