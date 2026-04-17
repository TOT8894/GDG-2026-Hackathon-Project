import express from "express";
import {
  createPayment,
  getPaymentById,
  getUserPayments,
  updatePaymentStatus
} from "../controller/paymentController.js";
import { verifyToken } from "../middleware/authentication.js";
const paymentRoutes = express.Router();
paymentRoutes.post("/", verifyToken, createPayment);
paymentRoutes.get("/", verifyToken, getUserPayments);
paymentRoutes.get("/:id", verifyToken, getPaymentById);
paymentRoutes.put("/:id/status", verifyToken, updatePaymentStatus);
export default paymentRoutes;