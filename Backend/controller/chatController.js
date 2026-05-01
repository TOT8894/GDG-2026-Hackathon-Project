import ChatMessage from "../models/chatModel.js";
import User from "../models/userModel.js";
import { notify } from "../utils/notify.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const getSenderId = (req) => req.user._id || req.user.id;

export const sendMessage = async (req, res) => {
    try {
        const senderId = getSenderId(req);
        const { receiverId, message, imageUrl, listingId } = req.body;

        console.log("Send message request:", { senderId, receiverId, message, imageUrl, listingId });

        if (!receiverId || !isValidObjectId(receiverId))
            return res.status(400).json({ error: "Valid receiverId is required" });
        if (!message && !imageUrl)
            return res.status(400).json({ error: "message or imageUrl is required" });

        const receiver = await User.findById(receiverId);
        if (!receiver) return res.status(404).json({ error: "Receiver not found" });

        if (listingId && !isValidObjectId(listingId))
            return res.status(400).json({ error: "Invalid listingId" });

        const chat = await ChatMessage.create({
            senderId,
            receiverId,
            message: message || null,
            imageUrl: imageUrl || null,
            listingId: listingId || null,
        });

        await chat.populate("senderId", "fullName email avatar role");
        await chat.populate("receiverId", "fullName email avatar role");
        if (listingId) await chat.populate("listingId", "title images price");

        console.log("Message created:", chat);

        // Notify receiver
        try {
            await notify({
                userId: receiverId,
                title: `New message from ${req.user.fullName || "someone"}`,
                message: message ? message.slice(0, 80) : "📷 Image",
                type: "chat",
                link: `/chat?userId=${senderId}`,
                relatedId: chat._id,
                actorName: req.user.fullName,
            });
        } catch (notifyError) {
            console.error("Notification failed:", notifyError);
            // Don't fail the request if notification fails
        }

        return res.status(201).json({ message: "Message sent", data: chat });
    } catch (err) {
        console.error("Send message error:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const getMyChats = async (req, res) => {
    try {
        const userId = getSenderId(req);
        const { page = 1, limit = 50 } = req.query;

        console.log("Get my chats request:", { userId, page, limit });

        // Get latest message per conversation partner
        const chats = await ChatMessage.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
        })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .populate("senderId", "fullName email avatar role")
            .populate("receiverId", "fullName email avatar role")
            .populate("listingId", "title images price");

        console.log("Found chats:", chats.length);

        return res.status(200).json({ data: chats });
    } catch (err) {
        console.error("Get my chats error:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const getConversation = async (req, res) => {
    try {
        const userId = getSenderId(req);
        const { userId: otherUserId } = req.params;
        const { listingId } = req.query;

        console.log("Get conversation request:", { userId, otherUserId, listingId });

        if (!isValidObjectId(otherUserId))
            return res.status(400).json({ error: "Valid userId is required" });

        const filter = {
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId },
            ],
        };
        if (listingId && isValidObjectId(listingId)) filter.listingId = listingId;

        const chats = await ChatMessage.find(filter)
            .sort({ createdAt: 1 })
            .populate("senderId", "fullName email avatar role")
            .populate("receiverId", "fullName email avatar role")
            .populate("listingId", "title images price");

        console.log("Found conversation messages:", chats.length);

        return res.status(200).json({ data: chats });
    } catch (err) {
        console.error("Get conversation error:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const getChatById = async (req, res) => {
    try {
        const userId = getSenderId(req);
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ error: "Valid id required" });

        const chat = await ChatMessage.findOne({
            _id: id,
            $or: [{ senderId: userId }, { receiverId: userId }],
        })
            .populate("senderId", "fullName email")
            .populate("receiverId", "fullName email");

        if (!chat) return res.status(404).json({ error: "Chat not found" });
        return res.status(200).json({ data: chat });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const userId = getSenderId(req);
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ error: "Valid id required" });

        const chat = await ChatMessage.findOneAndDelete({
            _id: id,
            $or: [{ senderId: userId }, { receiverId: userId }],
        });
        if (!chat) return res.status(404).json({ error: "Message not found or not authorized" });
        return res.status(200).json({ message: "Message deleted" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const markMessageRead = async (req, res) => {
    try {
        const userId = getSenderId(req);
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ error: "Valid id required" });

        const chat = await ChatMessage.findOne({ _id: id, receiverId: userId });
        if (!chat) return res.status(404).json({ error: "Message not found" });
        chat.status = "seen";
        await chat.save();
        return res.status(200).json({ message: "Marked as read", data: chat });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Admin: get all conversations (for moderation)
export const getAllChats = async (req, res) => {
    try {
        const { page = 1, limit = 50, userId } = req.query;
        const filter = userId ? { $or: [{ senderId: userId }, { receiverId: userId }] } : {};
        const chats = await ChatMessage.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .populate("senderId", "fullName email role")
            .populate("receiverId", "fullName email role")
            .populate("listingId", "title price");
        const total = await ChatMessage.countDocuments(filter);
        return res.status(200).json({ data: chats, total });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};