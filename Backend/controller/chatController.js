import ChatMessage from "../models/chatModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateChatBody = ({ message, audioUrl, videoUrl, imageUrl }) => {
    const contentFields = [message, audioUrl, videoUrl, imageUrl].filter(Boolean);
    if (contentFields.length === 0) {
        return "At least one content type is required: message, audioUrl, videoUrl or imageUrl.";
    }
    if (contentFields.length > 1) {
        return "Only one content type can be sent in a single chat message.";
    }
    return null;
};

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, message, audioUrl, videoUrl, imageUrl } = req.body;

        if (!receiverId || !isValidObjectId(receiverId)) {
            return res.status(400).json({ error: "Valid receiverId is required." });
        }

        const validationError = validateChatBody({ message, audioUrl, videoUrl, imageUrl });
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ error: "Receiver not found." });
        }

        const chat = new ChatMessage({
            senderId,
            receiverId,
            message,
            audioUrl,
            videoUrl,
            imageUrl,
        });
        console.log("Chat message created:", chat);
        const savedChat = await chat.save();
        return res.status(201).json({ message: "Message sent successfully", data: savedChat });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getMyChats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, contactId } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const filter = {
            $or: [{ senderId: userId }, { receiverId: userId }],
        };

        if (contactId && isValidObjectId(contactId)) {
            filter.$and = [
                {
                    $or: [
                        { senderId: contactId },
                        { receiverId: contactId },
                    ],
                },
            ];
        }

        const chats = await ChatMessage.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("senderId", "fullName email")
            .populate("receiverId", "fullName email");

        return res.status(200).json({ data: chats, page: Number(page), limit: Number(limit) });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { userId: otherUserId } = req.params;

        if (!isValidObjectId(otherUserId)) {
            return res.status(400).json({ error: "Valid conversation userId is required" });
        }

        const chats = await ChatMessage.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId },
            ],
        })
            .sort({ createdAt: 1 })
            .populate("senderId", "fullName email")
            .populate("receiverId", "fullName email");

        return res.status(200).json({ data: chats });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getChatById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Valid chat id is required" });
        }

        const chat = await ChatMessage.findOne({
            _id: id,
            $or: [{ senderId: userId }, { receiverId: userId }],
        })
            .populate("senderId", "fullName email")
            .populate("receiverId", "fullName email");

        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        return res.status(200).json({ data: chat });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const updateMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { message, audioUrl, videoUrl, imageUrl, status } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Valid chat id is required." });
        }

        const chat = await ChatMessage.findOne({ _id: id, senderId: userId });
        if (!chat) {
            return res.status(404).json({ error: "Message not found or not owned by you." });
        }

        if (message !== undefined || audioUrl !== undefined || videoUrl !== undefined || imageUrl !== undefined) {
            const validationError = validateChatBody({ message, audioUrl, videoUrl, imageUrl });
            if (validationError) {
                return res.status(400).json({ error: validationError });
            }

            chat.message = message || null;
            chat.audioUrl = audioUrl || null;
            chat.videoUrl = videoUrl || null;
            chat.imageUrl = imageUrl || null;
        }

        if (status !== undefined) {
            chat.status = status;
        }

        const updatedChat = await chat.save();
        return res.status(200).json({ message: "Message updated successfully", data: updatedChat });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Valid chat id is required" });
        }

        const chat = await ChatMessage.findOneAndDelete({
            _id: id,
            $or: [{ senderId: userId }, { receiverId: userId }],
        });

        if (!chat) {
            return res.status(404).json({ error: "Message not found or not authorized" });
        }

        return res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const markMessageRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Valid chat id is required" });
        }

        const chat = await ChatMessage.findOne({ _id: id, receiverId: userId });
        if (!chat) {
            return res.status(404).json({ error: "Message not found or not authorized" });
        }

        chat.status = "seen";
        await chat.save();

        return res.status(200).json({ message: "Message marked as read", data: chat });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
