import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { listingsApi, chatApi } from "../lib/api";
import SiteHeader from "../components/SiteHeader";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ListingDetailPage({ theme, setTheme }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { addToCart } = useCart();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        loadListing();
    }, [id]);

    async function loadListing() {
        try {
            setLoading(true);
            const response = await listingsApi.getById(id);
            setListing(response.data || response);
        } catch (err) {
            setError("Failed to load listing");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddToCart() {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        try {
            await addToCart(listing._id, quantity);
            alert("Item added to cart!");
        } catch (err) {
            alert(err.message || "Failed to add to cart");
        }
    }

    async function handleChatWithSeller() {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        // Extract sellerId — handle both populated object and plain string/ObjectId
        const sellerId = listing.sellerId?._id
            ? String(listing.sellerId._id)
            : listing.sellerId
                ? String(listing.sellerId)
                : null;

        const myId = String(user?._id || user?.id || "");

        if (!sellerId) {
            alert("Seller information is not available for this listing.");
            return;
        }

        if (myId === sellerId) {
            alert("You cannot chat with yourself!");
            return;
        }

        // Navigate to chat — the chat page will open the conversation
        // Also send an opening message in the background (non-blocking)
        navigate(`/chat?userId=${sellerId}`);

        try {
            await chatApi.sendMessage({
                receiverId: sellerId,
                message: `Hi! I'm interested in your listing: "${listing.title}"`,
            });
        } catch (err) {
            // Silently ignore — conversation is already open in chat page
            console.warn("Opening message failed (may already exist):", err.message);
        }
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

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <SiteHeader theme={theme} setTheme={setTheme} />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error || "Listing not found"}
                    </div>
                    <Link
                        to="/marketplace"
                        className="inline-block mt-4 text-indigo-600 hover:text-indigo-800"
                    >
                        ← Back to Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    const sellerId = listing.sellerId?._id || listing.sellerId;
    const myId = user?._id || user?.id;
    const isOwnListing = user && String(myId) === String(sellerId);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SiteHeader theme={theme} setTheme={setTheme} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    to="/marketplace"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Marketplace
                </Link>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                        {/* Images */}
                        <div>
                            <div className="aspect-w-16 aspect-h-12 mb-4">
                                {listing.images && listing.images.length > 0 ? (
                                    <img
                                        src={listing.images[selectedImage]}
                                        alt={listing.title}
                                        className="w-full h-96 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg">
                                        <span className="text-gray-400 text-lg">No Image Available</span>
                                    </div>
                                )}
                            </div>

                            {listing.images && listing.images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto">
                                    {listing.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index
                                                ? "border-indigo-500"
                                                : "border-gray-200 dark:border-gray-600"
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${listing.title} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div>
                            <div className="mb-4">
                                <span className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full mb-2">
                                    {listing.category}
                                </span>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {listing.title}
                                </h1>
                                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                                    {listing.price} {listing.currency || 'ETB'}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Description
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {listing.description}
                                </p>
                            </div>

                            {/* Seller Info */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Seller Information
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        {listing.sellerId?.fullName?.charAt(0) || 'S'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {listing.sellerId?.fullName || 'Unknown Seller'}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Trust Score: {listing.sellerId?.trustScore || 0}/5
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            {listing.location && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Location
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {listing.location.address || `${listing.location.latitude}, ${listing.location.longitude}`}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            {!isOwnListing && listing.status === "active" && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Quantity:
                                        </label>
                                        <select
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleAddToCart}
                                            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                        >
                                            Add to Cart
                                        </button>

                                        <button
                                            onClick={handleChatWithSeller}
                                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            Chat with Seller
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isOwnListing && (
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                                    This is your listing. You can manage it from your seller dashboard.
                                </div>
                            )}

                            {listing.status !== "active" && (
                                <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
                                    This item is no longer available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}