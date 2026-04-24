import express from "express";
import {
  confirmPayment,
  createPayment,
  getPaymentById,
  getPaymentHistory,
  getUserPayments,
  initiatePayment,
  refundPayment,
  releasePayment,
} from "../controller/paymentController.js";
import { authenticateAccessToken } from "../middleware/authentication.js";
const paymentRoutes = express.Router();
paymentRoutes.post("/", authenticateAccessToken, createPayment);
paymentRoutes.post("/initiate", authenticateAccessToken, initiatePayment);
paymentRoutes.post("/confirm", authenticateAccessToken, confirmPayment);
paymentRoutes.post("/release", authenticateAccessToken, releasePayment);
paymentRoutes.post("/refund", authenticateAccessToken, refundPayment);
paymentRoutes.get("/history", authenticateAccessToken, getPaymentHistory);
paymentRoutes.get("/:id", authenticateAccessToken, getPaymentById);
paymentRoutes.get("/", authenticateAccessToken, getUserPayments);
export default paymentRoutes;
