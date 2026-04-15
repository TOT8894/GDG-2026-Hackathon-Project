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
import { verifyToken } from "../middleware/authentication.js";

const router = express.Router();

router.post("/", verifyToken, sendMessage);
router.get("/", verifyToken, getMyChats);
router.get("/conversation/:userId", verifyToken, getConversation);
router.get("/:id", verifyToken, getChatById);
router.put("/:id", verifyToken, updateMessage);
router.delete("/:id", verifyToken, deleteMessage);
router.put("/:id/read", verifyToken, markMessageRead);

export default router;
