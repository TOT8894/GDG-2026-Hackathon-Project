import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { listingsApi, ordersApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function SellerDashboardPage({ theme, setTheme }) {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("listings");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const [listingsResponse, ordersResponse] = await Promise.all([
                listingsApi.getMyListings(),
                ordersApi.getAll({ role: "seller" })
            ]);

            setListings(listingsResponse.data || listingsResponse || []);
            setOrders(ordersResponse.data || ordersResponse || []);
        } catch (err) {
            console.error("Failed to load data:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleMarkAsSold(listingId) {
        try {
            await listingsApi.markAsSold(listingId);
            await loadData(); // Reload data
        } catch (err) {
            alert("Failed to mark as sold");
        }
    }

    async function handleDeleteListing(listingId) {
        if (!confirm("Are you sure you want to delete this listing?")) return;

        try {
            await listingsApi.delete(listingId);
            await loadData(); // Reload data
        } catch (err) {
            alert("Failed to delete listing");
        }
    }

    const stats = {
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === "active").length,
        soldListings: listings.filter(l => l.status === "sold").length,
        totalOrders: orders.length,
    };

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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Seller Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Welcome back, {user?.fullName}!
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {stats.totalListings}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">Total Listings</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {stats.activeListings}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">Active Listings</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.soldListings}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">Sold Items</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {stats.totalOrders}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">Total Orders</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <Link
                        to="/create-listing"
                        className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create New Listing
                    </Link>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab("listings")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "listings"
                                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                            >
                                My Listings ({listings.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("orders")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "orders"
                                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                            >
                                Orders ({orders.length})
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === "listings" && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        {listings.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                                    You haven't created any listings yet
                                </div>
                                <Link
                                    to="/create-listing"
                                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    Create Your First Listing
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {listings.map((listing) => (
                                    <div key={listing._id} className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0">
                                                {listing.images && listing.images.length > 0 ? (
                                                    <img
                                                        src={listing.images[0]}
                                                        alt={listing.title}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                        <span className="text-gray-400 text-xs">No Image</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                    {listing.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                                                    {listing.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                                        {listing.price} ETB
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${listing.status === "active"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                            : listing.status === "sold"
                                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                        }`}>
                                                        {listing.status}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        {listing.views || 0} views
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/listing/${listing._id}`}
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                >
                                                    View
                                                </Link>

                                                {listing.status === "active" && (
                                                    <button
                                                        onClick={() => handleMarkAsSold(listing._id)}
                                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                    >
                                                        Mark as Sold
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDeleteListing(listing._id)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "orders" && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        {orders.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-500 dark:text-gray-400 text-lg">
                                    No orders yet
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {orders.map((order) => (
                                    <div key={order._id} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Order #{order._id.slice(-8)}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                    {order.items?.length || 0} items • {order.totalAmount} ETB
                                                </p>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                        : order.status === "confirmed"
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                            : order.status === "shipped"
                                                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                                : order.status === "delivered"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                    }`}>
                                                    {order.status}
                                                </span>
                                                <div className="mt-2">
                                                    <Link
                                                        to={`/orders/${order._id}`}
                                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}