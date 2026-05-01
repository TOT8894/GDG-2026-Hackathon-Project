import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi, ApiError, getAccessToken } from "../lib/api";
import SiteHeader from "../components/SiteHeader";
import { Camera, Upload, X } from "lucide-react";

export default function ProfilePage({ theme, setTheme }) {
    const { user, reloadProfile } = useAuth();
    const navigate = useNavigate();

    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");
    const [avatar, setAvatar] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFullName(user.fullName || user.name || "");
            setEmail(user.email || "");
            setPhone(user.phone || "");
            setRole(user.role || "buyer");
            setAvatar(user.avatar || "");
            setAvatarPreview(user.avatar || "");
        }
    }, [user]);

    // Handle image file selection
    function handleImageSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            return;
        }

        setAvatarFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
        setError("");
    }

    // Upload image to backend
    async function uploadImage(file) {
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/upload-avatar`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Image upload failed");
        }
        return data.url;
    }

    function removeAvatar() {
        setAvatarFile(null);
        setAvatarPreview("");
        setAvatar("");
    }

    async function handleUpdateProfile(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSubmitting(true);

        try {
            const updates = {};

            // Check what changed
            if (fullName !== user.fullName) updates.fullName = fullName;
            if (email !== user.email) updates.email = email;
            if (phone !== user.phone) updates.phone = phone;
            if (role !== user.role) updates.role = role;

            // Handle avatar upload if file selected
            if (avatarFile) {
                setUploadingImage(true);
                try {
                    const uploadedUrl = await uploadImage(avatarFile);
                    updates.avatar = uploadedUrl;
                } catch (err) {
                    setError("Failed to upload image. Please try again.");
                    setSubmitting(false);
                    setUploadingImage(false);
                    return;
                }
                setUploadingImage(false);
            } else if (avatar !== user.avatar) {
                updates.avatar = avatar;
            }

            if (Object.keys(updates).length === 0) {
                setError("No changes to save");
                setSubmitting(false);
                return;
            }

            await authApi.updateProfile(updates);
            await reloadProfile();
            setSuccess("Profile updated successfully");
            setEditing(false);
            setAvatarFile(null);
        } catch (err) {
            const msg =
                err instanceof ApiError
                    ? err.message
                    : err?.message || "Failed to update profile";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    }

    function handleCancel() {
        setEditing(false);
        setError("");
        setSuccess("");
        setAvatarFile(null);
        if (user) {
            setFullName(user.fullName || user.name || "");
            setEmail(user.email || "");
            setPhone(user.phone || "");
            setRole(user.role || "buyer");
            setAvatar(user.avatar || "");
            setAvatarPreview(user.avatar || "");
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SiteHeader theme={theme} setTheme={setTheme} />

            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="rounded-3xl bg-white p-8 shadow-checkout dark:bg-gray-800">

                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            My Profile
                        </h1>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="rounded-xl bg-ng-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-ng-primary-700 dark:bg-ng-primary-500 dark:hover:bg-ng-primary-400"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {error && (
                        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">
                            {success}
                        </p>
                    )}

                    <form onSubmit={handleUpdateProfile} className="grid gap-6">

                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                            <div className="relative">
                                <div className="size-24 overflow-hidden rounded-full bg-gray-200 ring-4 ring-gray-100 dark:bg-gray-700 dark:ring-gray-800">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="size-full object-cover" />
                                    ) : (
                                        <div className="flex size-full items-center justify-center text-3xl font-bold text-gray-500 dark:text-gray-400">
                                            {(fullName || email || "U").charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {editing && (
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-0 right-0 flex size-8 cursor-pointer items-center justify-center rounded-full bg-ng-primary-600 text-white shadow-lg transition hover:bg-ng-primary-700"
                                    >
                                        <Camera className="size-4" />
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {editing && (
                                <div className="flex-1 text-center sm:text-left">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Profile Picture
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        JPG, PNG or GIF. Max size 5MB.
                                    </p>
                                    {avatarPreview && (
                                        <button
                                            type="button"
                                            onClick={removeAvatar}
                                            className="mt-2 inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                                        >
                                            <X className="size-4" />
                                            Remove photo
                                        </button>
                                    )}
                                    {uploadingImage && (
                                        <p className="mt-2 text-sm text-ng-primary-600 dark:text-ng-primary-400">
                                            Uploading image...
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Full Name */}
                        <div className="grid gap-2">
                            <label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                disabled={!editing}
                                required
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800"
                            />
                        </div>

                        {/* Email */}
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={!editing}
                                required
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800"
                            />
                        </div>

                        {/* Phone */}
                        <div className="grid gap-2">
                            <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={!editing}
                                placeholder="Optional"
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800"
                            />
                        </div>

                        {/* Role */}
                        <div className="grid gap-2">
                            <label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Account Type
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                disabled={!editing}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-ng-primary-500 focus-visible:ring-2 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800"
                            >
                                <option value="buyer">Buyer - I want to buy products</option>
                                <option value="seller">Seller - I want to sell products</option>
                                {user?.role === "admin" && (
                                    <option value="admin">Admin - Platform administrator</option>
                                )}
                            </select>
                            {editing && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.role === "admin"
                                        ? "Admins can switch between all roles"
                                        : "You can switch between Buyer and Seller roles"}
                                </p>
                            )}
                        </div>

                        {/* Account Info (Read-only) */}
                        <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Account Status</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {user?.isActive ? "Active" : "Inactive"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Verified</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {user?.isVerified ? "Yes" : "No"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Trust Score</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {user?.trustScore || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Member Since</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {editing && (
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting || uploadingImage}
                                    className="flex-1 rounded-xl bg-ng-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-ng-primary-700 disabled:opacity-60 dark:bg-ng-primary-500 dark:hover:bg-ng-primary-400"
                                >
                                    {submitting ? "Saving..." : uploadingImage ? "Uploading..." : "Save Changes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={submitting || uploadingImage}
                                    className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </form>

                    {/* Change Password Link */}
                    <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
                        <button
                            onClick={() => navigate("/change-password")}
                            className="text-sm font-medium text-ng-primary-600 hover:underline dark:text-ng-primary-400"
                        >
                            Change Password →
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
