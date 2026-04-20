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

const router = express.Router();

router.post("/", authenticateAccessToken, sendMessage);
router.get("/", authenticateAccessToken, getMyChats);
router.get("/conversation/:userId", authenticateAccessToken, getConversation);
router.get("/:id", authenticateAccessToken, getChatById);
router.put("/:id", authenticateAccessToken, updateMessage);
router.delete("/:id", authenticateAccessToken, deleteMessage);
router.put("/:id/read", authenticateAccessToken, markMessageRead);

export default router;
