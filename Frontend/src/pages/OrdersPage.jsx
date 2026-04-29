import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { ordersApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Package, ShoppingBag } from "lucide-react";

export default function OrdersPage({ theme, setTheme }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("buyer"); // 'buyer' or 'seller'

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await ordersApi.getAll();
      const data = Array.isArray(response) ? response : response.data || [];
      setOrders(data);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const buyerOrders = orders.filter((order) => order.buyerId._id === user?._id);
  const sellerOrders = orders.filter((order) => order.sellerId._id === user?._id);
  const displayOrders = activeTab === "buyer" ? buyerOrders : sellerOrders;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader theme={theme} setTheme={setTheme} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          My Orders
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("buyer")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === "buyer"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
          >
            <ShoppingBag className="w-5 h-5" />
            As Buyer ({buyerOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("seller")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === "seller"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
          >
            <Package className="w-5 h-5" />
            As Seller ({sellerOrders.length})
          </button>
        </div>

        {/* Content */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No orders found as {activeTab}
            </p>
            {activeTab === "buyer" && (
              <Link
                to="/marketplace"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Browse Marketplace
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-6">
                  {/* Listing Image */}
                  <div className="flex-shrink-0">
                    {order.listingId?.images?.[0] ? (
                      <img
                        src={order.listingId.images[0]}
                        alt={order.listingId.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {order.listingId?.title || "Listing Unavailable"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Order ID: {order._id}
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <p className="text-xl font-bold text-green-600 dark:text-green-400 mb-3">
                      {order.price} ETB
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span>
                        {activeTab === "buyer" ? "Seller" : "Buyer"}:{" "}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {activeTab === "buyer"
                            ? order.sellerId?.fullName
                            : order.buyerId?.fullName}
                        </span>
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Details
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
