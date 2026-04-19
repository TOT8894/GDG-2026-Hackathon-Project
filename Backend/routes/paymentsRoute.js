import express from "express";
import {
  createPayment,
  getPaymentById,
  getUserPayments,
} from "../controller/paymentController.js";
import { verifyToken } from "../middleware/authentication.js";
const paymentRoutes = express.Router();
paymentRoutes.post("/", verifyToken, createPayment);
paymentRoutes.get("/", verifyToken, getUserPayments);
paymentRoutes.get("/:id", verifyToken, getPaymentById);
// paymentRoutes.put("/:id/status", verifyToken, updatePaymentStatus); // will be used if needed
export default paymentRoutes;