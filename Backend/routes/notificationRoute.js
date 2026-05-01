import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
} from "../controller/notificationController.js";
import { authenticateAccessToken } from "../middleware/authentication.js";

const notificationRoutes = express.Router();
notificationRoutes.use(authenticateAccessToken);

notificationRoutes.get("/", getNotifications);
notificationRoutes.get("/unread-count", getUnreadCount);
notificationRoutes.post("/read", markAsRead);
notificationRoutes.post("/read-all", markAllAsRead);
notificationRoutes.delete("/clear-all", clearAll);
notificationRoutes.delete("/:id", deleteNotification);

export default notificationRoutes;
