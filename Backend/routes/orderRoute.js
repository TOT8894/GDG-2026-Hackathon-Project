import express from "express";
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
} from "../controller/orderController.js";
import { authenticateAccessToken } from "../middleware/authentication.js";

const orderRoutes = express.Router();

orderRoutes.use(authenticateAccessToken);
orderRoutes.post("/create", createOrder);
orderRoutes.get("/", getUserOrders);
orderRoutes.patch("/:id/status", updateOrderStatus);
orderRoutes.put("/:id/status", updateOrderStatus);
orderRoutes.get("/:id", getOrderById);

export default orderRoutes;
