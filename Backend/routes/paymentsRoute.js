import express from "express";
import {
  createPayment,
  getPaymentById,
  getUserPayments,
} from "../controller/paymentController.js";
import { authenticateAccessToken } from "../middleware/authentication.js";
const paymentRoutes = express.Router();
paymentRoutes.post("/", authenticateAccessToken, createPayment);
paymentRoutes.get("/", authenticateAccessToken, getUserPayments);
paymentRoutes.get("/:id", authenticateAccessToken, getPaymentById);
export default paymentRoutes;