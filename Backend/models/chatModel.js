import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        listingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            default: null,
        },
        message: {
            type: String,
            trim: true,
        },
        audioUrl: {
            type: String,
            trim: true,
        },
        videoUrl: {
            type: String,
            trim: true,
        },
        imageUrl: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["sent", "delivered", "seen"],
            default: "sent",
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
chatSchema.index({ senderId: 1, receiverId: 1 });
chatSchema.index({ listingId: 1 });
chatSchema.index({ createdAt: -1 });

const ChatMessage = mongoose.model("ChatMessage", chatSchema);
export default ChatMessage;
