import express from "express";
import {
    sendMessage,
    getMyChats,
    getConversation,
    getChatById,
    updateMessage,
    deleteMessage,
    markMessageRead,
} from "../controller/chatController.js";
import { authenticateAccessToken } from "../middleware/authentication.js";

const chatRoutes = express.Router();


chatRoutes.post("/", authenticateAccessToken, sendMessage);
chatRoutes.get("/", authenticateAccessToken, getMyChats);
chatRoutes.get("/conversation/:userId", authenticateAccessToken, getConversation);
chatRoutes.get("/:id", authenticateAccessToken, getChatById);
chatRoutes.put("/:id", authenticateAccessToken, updateMessage);
chatRoutes.delete("/:id", authenticateAccessToken, deleteMessage);
chatRoutes.put("/:id/read", authenticateAccessToken, markMessageRead);

export default chatRoutes;
