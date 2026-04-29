import express from "express";
import {
    sendMessage, getMyChats, getConversation,
    getChatById, deleteMessage, markMessageRead, getAllChats,
} from "../controller/chatController.js";
import { authenticateAccessToken } from "../middleware/authentication.js";
import { authorization as authorize } from "../middleware/autherization.js";

const chatRoutes = express.Router();
chatRoutes.use(authenticateAccessToken);

// Admin: see all messages
chatRoutes.get("/admin/all", authorize("admin"), getAllChats);

// User routes
chatRoutes.post("/", sendMessage);
chatRoutes.get("/", getMyChats);
chatRoutes.get("/conversation/:userId", getConversation);
chatRoutes.get("/:id", getChatById);
chatRoutes.delete("/:id", deleteMessage);
chatRoutes.put("/:id/read", markMessageRead);

export default chatRoutes;
