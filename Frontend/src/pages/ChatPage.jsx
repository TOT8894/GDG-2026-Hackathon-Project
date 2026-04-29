import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { chatApi, ApiError } from "../lib/api";
import SiteHeader from "../components/SiteHeader";
import {
    Send,
    Search,
    MoreVertical,
    Check,
    CheckCheck,
    X,
    ArrowLeft,
    MessageSquare,
} from "lucide-react";

// Safe id extractor — handles both populated objects and plain strings
const getId = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return String(val._id || val.id || val);
};

// Format timestamp like Telegram
function formatTime(date) {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (d.toDateString() === now.toDateString())
        return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    if (diff < 604800000) return d.toLocaleDateString("en-US", { weekday: "short" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ChatPage({ theme, setTheme }) {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const myId = getId(user?._id || user?.id);

    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const pollRef = useRef(null);

    const scrollToBottom = () =>
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load contacts on mount
    useEffect(() => {
        loadContacts();
    }, []);

    // Auto-select contact from ?userId= query param (from "Chat with Seller")
    useEffect(() => {
        const targetUserId = searchParams.get("userId");
        if (!targetUserId) return;

        // If contacts already loaded, find the existing one
        if (contacts.length > 0) {
            const existing = contacts.find((c) => getId(c) === targetUserId);
            if (existing) {
                setSelectedContact(existing);
                return;
            }
        }

        // Create a stub contact so the chat opens immediately
        // The messages will load via loadMessages
        setSelectedContact({ _id: targetUserId, fullName: "Seller", email: "" });
    }, [searchParams, contacts]);

    // Load messages when contact changes + start polling
    useEffect(() => {
        if (!selectedContact) return;
        loadMessages(getId(selectedContact));

        // Poll every 3 seconds for new messages
        pollRef.current = setInterval(() => {
            loadMessages(getId(selectedContact), true);
        }, 3000);

        return () => clearInterval(pollRef.current);
    }, [selectedContact]);

    const loadContacts = useCallback(async () => {
        try {
            setLoadingContacts(true);
            console.log("Loading contacts for user:", myId);

            const response = await chatApi.getMyChats({ page: 1, limit: 100 });
            console.log("Contacts response:", response);

            const chatsData = response.data || [];
            console.log("Chats data:", chatsData);

            // Build unique contact list from chat history
            const contactMap = new Map();
            chatsData.forEach((chat) => {
                const sId = getId(chat.senderId);
                const rId = getId(chat.receiverId);
                const isOwn = sId === myId;
                const contact = isOwn ? chat.receiverId : chat.senderId;
                const contactId = isOwn ? rId : sId;

                if (!contactMap.has(contactId)) {
                    contactMap.set(contactId, {
                        ...(typeof contact === "object" ? contact : { _id: contactId }),
                        lastMessage: chat.message || "📎 Media",
                        lastMessageTime: chat.createdAt,
                        unreadCount: 0,
                    });
                }

                // Count unread
                if (!isOwn && chat.status !== "seen") {
                    const c = contactMap.get(contactId);
                    c.unreadCount = (c.unreadCount || 0) + 1;
                }
            });

            const contacts = Array.from(contactMap.values());
            console.log("Processed contacts:", contacts);
            setContacts(contacts);
        } catch (err) {
            console.error("Failed to load contacts:", err);
        } finally {
            setLoadingContacts(false);
        }
    }, [myId]);

    const loadMessages = useCallback(
        async (contactId, silent = false) => {
            if (!contactId) return;
            try {
                if (!silent) setLoadingMessages(true);
                console.log("Loading messages for contact:", contactId);

                const response = await chatApi.getConversation(contactId);
                console.log("Messages response:", response);

                const msgs = response.data || [];
                console.log("Messages:", msgs);
                setMessages(msgs);

                // Mark unread messages as seen
                const unread = msgs.filter(
                    (m) => getId(m.receiverId) === myId && m.status !== "seen"
                );
                for (const m of unread) {
                    chatApi.markMessageRead(m._id).catch(() => { });
                }
            } catch (err) {
                console.error("Failed to load messages:", err);
                if (!silent) console.error("Failed to load messages:", err);
            } finally {
                if (!silent) setLoadingMessages(false);
            }
        },
        [myId]
    );

    async function handleSend(e) {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text || !selectedContact || sending) return;

        setSending(true);
        setError("");

        // Optimistic update
        const tempMsg = {
            _id: `temp-${Date.now()}`,
            senderId: { _id: myId },
            receiverId: { _id: getId(selectedContact) },
            message: text,
            status: "sent",
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMsg]);
        setNewMessage("");

        try {
            const response = await chatApi.sendMessage({
                receiverId: getId(selectedContact),
                message: text,
            });

            // Replace temp message with real one
            const realMsg = response.data || response;
            setMessages((prev) =>
                prev.map((m) => (m._id === tempMsg._id ? realMsg : m))
            );

            // Refresh contacts to update last message
            loadContacts();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to send message");
            // Remove temp message on failure
            setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    }

    async function handleDelete(messageId) {
        if (!window.confirm("Delete this message?")) return;
        try {
            await chatApi.deleteMessage(messageId);
            setMessages((prev) => prev.filter((m) => m._id !== messageId));
        } catch (err) {
            console.error("Delete failed:", err);
        }
    }

    function MessageStatus({ message }) {
        if (getId(message.senderId) !== myId) return null;
        if (message.status === "seen")
            return <CheckCheck className="size-3.5 text-blue-400" />;
        if (message.status === "delivered")
            return <CheckCheck className="size-3.5 text-gray-400" />;
        return <Check className="size-3.5 text-gray-400" />;
    }

    const filtered = contacts.filter(
        (c) =>
            c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const contactName = (c) => c.fullName || c.email || "Unknown";
    const contactInitial = (c) =>
        (c.fullName || c.email || "?").charAt(0).toUpperCase();

    return (
        <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
            <SiteHeader theme={theme} setTheme={setTheme} />

            <div className="flex flex-1 overflow-hidden">
                {/* ── Sidebar ── */}
                <div
                    className={`${selectedContact ? "hidden md:flex" : "flex"
                        } w-full flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 md:w-80`}
                >
                    {/* Header */}
                    <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Messages
                        </h2>
                    </div>

                    {/* Search */}
                    <div className="border-b border-gray-200 p-3 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-full border border-gray-200 bg-gray-100 py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {/* Contact list */}
                    <div className="flex-1 overflow-y-auto">
                        {loadingContacts ? (
                            <div className="flex items-center justify-center p-8 text-gray-400 text-sm">
                                Loading…
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
                                <MessageSquare className="size-10 mb-2 opacity-40" />
                                <p className="text-sm font-medium">No conversations yet</p>
                                <p className="mt-1 text-xs">
                                    Click "Chat with Seller" on any listing to start
                                </p>
                            </div>
                        ) : (
                            filtered.map((contact) => {
                                const cId = getId(contact);
                                const isActive = getId(selectedContact) === cId;
                                return (
                                    <button
                                        key={cId}
                                        onClick={() => setSelectedContact(contact)}
                                        className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/40 ${isActive
                                            ? "bg-indigo-50 dark:bg-indigo-900/20"
                                            : ""
                                            }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="flex size-11 items-center justify-center rounded-full bg-indigo-500 text-base font-semibold text-white">
                                                {contactInitial(contact)}
                                            </div>
                                            {contact.unreadCount > 0 && (
                                                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
                                                    {contact.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {contactName(contact)}
                                                </p>
                                                <span className="ml-2 shrink-0 text-xs text-gray-400">
                                                    {formatTime(contact.lastMessageTime)}
                                                </span>
                                            </div>
                                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                {contact.lastMessage}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── Chat area ── */}
                <div
                    className={`${selectedContact ? "flex" : "hidden md:flex"
                        } flex-1 flex-col`}
                >
                    {selectedContact ? (
                        <>
                            {/* Chat header */}
                            <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                                <button
                                    onClick={() => setSelectedContact(null)}
                                    className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
                                >
                                    <ArrowLeft className="size-5 text-gray-600 dark:text-gray-400" />
                                </button>

                                <div className="flex size-10 items-center justify-center rounded-full bg-indigo-500 text-white font-semibold">
                                    {contactInitial(selectedContact)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                                        {contactName(selectedContact)}
                                    </p>
                                    {selectedContact.email && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {selectedContact.email}
                                        </p>
                                    )}
                                </div>

                                <button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <MoreVertical className="size-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900">
                                {loadingMessages ? (
                                    <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                                        Loading messages…
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                                        <MessageSquare className="size-12 mb-3 opacity-30" />
                                        <p className="font-medium">No messages yet</p>
                                        <p className="mt-1 text-sm">Say hello to start the conversation!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {messages.map((msg, idx) => {
                                            const isOwn = getId(msg.senderId) === myId;
                                            const prevMsg = messages[idx - 1];
                                            const showDate =
                                                !prevMsg ||
                                                new Date(prevMsg.createdAt).toDateString() !==
                                                new Date(msg.createdAt).toDateString();

                                            return (
                                                <div key={msg._id}>
                                                    {showDate && (
                                                        <div className="my-4 flex items-center justify-center">
                                                            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                                                {new Date(msg.createdAt).toLocaleDateString("en-US", {
                                                                    weekday: "long",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                })}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}
                                                    >
                                                        <div className={`group relative max-w-[72%]`}>
                                                            <div
                                                                className={`rounded-2xl px-4 py-2 shadow-sm ${isOwn
                                                                    ? "rounded-br-sm bg-indigo-600 text-white"
                                                                    : "rounded-bl-sm bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                                                                    }`}
                                                            >
                                                                {/* Listing context card */}
                                                                {msg.listingId && typeof msg.listingId === "object" && (
                                                                    <div className={`mb-2 rounded-lg p-2 text-xs ${isOwn ? "bg-indigo-700/50" : "bg-gray-100 dark:bg-gray-700"}`}>
                                                                        <p className="font-semibold">{msg.listingId.title}</p>
                                                                        <p>{msg.listingId.price} ETB</p>
                                                                    </div>
                                                                )}

                                                                {msg.message && (
                                                                    <p className="break-words text-sm leading-relaxed">
                                                                        {msg.message}
                                                                    </p>
                                                                )}
                                                                {msg.imageUrl && (
                                                                    <img
                                                                        src={msg.imageUrl}
                                                                        alt="Shared"
                                                                        className="mt-1 max-w-full rounded-lg"
                                                                    />
                                                                )}

                                                                <div
                                                                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isOwn ? "text-indigo-200" : "text-gray-400"
                                                                        }`}
                                                                >
                                                                    <span>{formatTime(msg.createdAt)}</span>
                                                                    <MessageStatus message={msg} />
                                                                </div>
                                                            </div>

                                                            {/* Delete button (own messages only) */}
                                                            {isOwn && (
                                                                <button
                                                                    onClick={() => handleDelete(msg._id)}
                                                                    className="absolute -left-7 top-1/2 hidden -translate-y-1/2 rounded-full p-1 hover:bg-gray-200 group-hover:flex dark:hover:bg-gray-700"
                                                                >
                                                                    <X className="size-3.5 text-gray-500" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Error banner */}
                            {error && (
                                <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                                    {error}
                                    <button
                                        onClick={() => setError("")}
                                        className="ml-2 underline"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            )}

                            {/* Input */}
                            <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                                <form onSubmit={handleSend} className="flex items-end gap-2">
                                    <textarea
                                        ref={inputRef}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend(e);
                                            }
                                        }}
                                        placeholder="Type a message…"
                                        rows={1}
                                        className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-40"
                                    >
                                        <Send className="size-4" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                            <MessageSquare className="size-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a conversation</p>
                            <p className="mt-1 text-sm">
                                Or click "Chat with Seller" on any product listing
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
