import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notificationController.js";

import { authenticateAccessToken } from "../middleware/authentication.js";

const router = express.Router();

router.use(authenticateAccessToken);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);

router.post("/read", markAsRead);
router.post("/read-all", markAllAsRead);

router.delete("/:id", deleteNotification);

export default router;
