import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import LocationPicker from "../components/LocationPicker";
import ImageUploader from "../components/ImageUploader";
import { listingsApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, CheckCircle } from "lucide-react";

const CATEGORIES = [
    "Electronics", "Clothing", "Home & Garden", "Sports",
    "Books", "Automotive", "Health & Beauty", "Toys & Games",
    "Food & Beverages", "Other",
];

const CONDITIONS = [
    { value: "new", label: "New" },
    { value: "used", label: "Used" },
    { value: "old", label: "Old" },
];

export default function CreateListingPage({ theme, setTheme }) {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
        condition: "used",
        images: [],
        // LocationPicker fires immediately with Addis Ababa default
        location: { latitude: 9.03, longitude: 38.74 },
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function handleLocation(location) {
        setForm(prev => ({ ...prev, location }));
    }

    function handleImages(images) {
        setForm(prev => ({ ...prev, images }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.title.trim()) return setError("Title is required");
        if (!form.description.trim()) return setError("Description is required");
        if (!form.price || parseFloat(form.price) <= 0) return setError("Enter a valid price");
        if (!form.category) return setError("Select a category");

        // Check role — must be seller or admin
        if (user?.role === "buyer") {
            return setError("You need a Seller account to create listings. Change your role in Profile settings.");
        }

        try {
            setLoading(true);
            await listingsApi.create({
                title: form.title.trim(),
                description: form.description.trim(),
                price: parseFloat(form.price),
                category: form.category,
                condition: form.condition,
                images: form.images,
                location: form.location,
            });
            setSuccess("Listing created successfully!");
            setTimeout(() => navigate("/seller-dashboard"), 1500);
        } catch (err) {
            setError(err.message || "Failed to create listing. Make sure your account role is Seller.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SiteHeader theme={theme} setTheme={setTheme} />

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Listing</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Fill in the details to list your product for sale
                    </p>
                    {user?.role && (
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            Logged in as: <span className="font-semibold capitalize">{user.role}</span>
                            {user.role === "buyer" && (
                                <span className="ml-2 text-amber-600 dark:text-amber-400">
                                    — Switch to Seller role in your Profile to create listings
                                </span>
                            )}
                        </p>
                    )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {error && (
                            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                                <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                                <CheckCircle className="size-4 shrink-0" />
                                {success}
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Product Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g. iPhone 13 Pro 256GB"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe your product — condition, features, reason for selling…"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Price / Category / Condition */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Price (ETB) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    min="1"
                                    step="1"
                                    placeholder="0"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Select…</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Condition
                                </label>
                                <select
                                    name="condition"
                                    value={form.condition}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Images */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Product Images <span className="text-gray-400 font-normal">(up to 5)</span>
                            </label>
                            <ImageUploader
                                images={form.images}
                                onChange={handleImages}
                                maxImages={5}
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Location <span className="text-gray-400 font-normal">(click map to set)</span>
                            </label>
                            <LocationPicker
                                onLocationSelect={handleLocation}
                                initialLocation={[form.location.latitude, form.location.longitude]}
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Lat: {form.location?.latitude?.toFixed(5)}, Lng: {form.location?.longitude?.toFixed(5)}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate("/seller-dashboard")}
                                className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Creating…" : "Create Listing"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
