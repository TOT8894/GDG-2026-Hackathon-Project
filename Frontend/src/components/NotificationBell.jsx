import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Trash2, X, ShoppingBag, DollarSign, MessageCircle, Package, AlertTriangle, Star } from "lucide-react";
import { notificationsApi } from "../lib/api";

const TYPE_ICON = {
    order: ShoppingBag,
    payment: DollarSign,
    chat: MessageCircle,
    listing: Package,
    fraud_alert: AlertTriangle,
    review: Star,
    system: Bell,
};

const TYPE_COLOR = {
    order: "text-blue-500",
    payment: "text-green-500",
    chat: "text-indigo-500",
    listing: "text-yellow-500",
    fraud_alert: "text-red-500",
    review: "text-orange-500",
    system: "text-gray-500",
};

function timeAgo(date) {
    const diff = Date.now() - new Date(date);
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}

export default function NotificationBell() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        function handler(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Poll unread count every 30s
    useEffect(() => {
        fetchUnread();
        const t = setInterval(fetchUnread, 30000);
        return () => clearInterval(t);
    }, []);

    async function fetchUnread() {
        try {
            const r = await notificationsApi.getUnreadCount();
            setUnread(r.unread || 0);
        } catch { }
    }

    async function fetchNotifications() {
        setLoading(true);
        try {
            const r = await notificationsApi.getAll({ limit: 20 });
            setNotifications(r.data || []);
            setUnread(r.unreadCount || 0);
        } catch { }
        setLoading(false);
    }

    function handleOpen() {
        setOpen((v) => !v);
        if (!open) fetchNotifications();
    }

    async function handleMarkRead(id, e) {
        e.stopPropagation();
        await notificationsApi.markRead(id);
        setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
        setUnread((c) => Math.max(0, c - 1));
    }

    async function handleMarkAllRead() {
        await notificationsApi.markAllRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnread(0);
    }

    async function handleDelete(id, e) {
        e.stopPropagation();
        await notificationsApi.delete(id);
        setNotifications((prev) => prev.filter((n) => n._id !== id));
    }

    async function handleClearAll() {
        await notificationsApi.clearAll();
        setNotifications([]);
        setUnread(0);
    }

    function handleClick(n) {
        if (!n.isRead) handleMarkRead(n._id, { stopPropagation: () => { } });
        if (n.link) {
            navigate(n.link);
            setOpen(false);
        }
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={handleOpen}
                className="relative flex size-9 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-700 transition hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                aria-label="Notifications"
            >
                <Bell className="size-4" />
                {unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:w-96">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Notifications {unread > 0 && <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 dark:bg-red-900/40 dark:text-red-300">{unread} new</span>}
                        </h3>
                        <div className="flex items-center gap-2">
                            {unread > 0 && (
                                <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
                                    Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={handleClearAll} className="text-xs text-gray-400 hover:text-red-500">
                                    Clear all
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="size-4" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="size-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <Bell className="size-10 mb-2 opacity-30" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const Icon = TYPE_ICON[n.type] || Bell;
                                const iconColor = TYPE_COLOR[n.type] || "text-gray-500";
                                return (
                                    <div
                                        key={n._id}
                                        onClick={() => handleClick(n)}
                                        className={`group flex cursor-pointer items-start gap-3 border-b border-gray-50 px-4 py-3 transition hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/30 ${!n.isRead ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}`}
                                    >
                                        <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                                            <Icon className="size-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm font-medium ${!n.isRead ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}>
                                                {n.title}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {n.message}
                                            </p>
                                            <p className="mt-1 text-[10px] text-gray-400">{timeAgo(n.createdAt)}</p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100">
                                            {!n.isRead && (
                                                <button
                                                    onClick={(e) => handleMarkRead(n._id, e)}
                                                    className="rounded p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                                                    title="Mark as read"
                                                >
                                                    <Check className="size-3 text-indigo-500" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(n._id, e)}
                                                className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/30"
                                                title="Delete"
                                            >
                                                <Trash2 className="size-3 text-red-400" />
                                            </button>
                                        </div>
                                        {!n.isRead && (
                                            <div className="mt-1.5 size-2 shrink-0 rounded-full bg-indigo-500" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
