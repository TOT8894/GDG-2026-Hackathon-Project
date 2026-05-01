import express from "express";
import admin from "../controller/adminController.js";
import { authenticateAccessToken } from "../middleware/authentication.js";
import { authorization as authorize } from "../middleware/autherization.js";

const adminRoutes = express.Router();
adminRoutes.use(authenticateAccessToken, authorize("admin"));

// Dashboard
adminRoutes.get("/stats", admin.getStats);
adminRoutes.get("/fraud-alerts", admin.getFraudAlerts);

// Users
adminRoutes.get("/users", admin.getUsers);
adminRoutes.get("/users/:id", admin.getUserDetail);
adminRoutes.post("/users/ban", admin.banUser);
adminRoutes.post("/users/unban", admin.unbanUser);
adminRoutes.post("/users/promote", admin.promoteToAdmin);
adminRoutes.post("/users/role", admin.changeUserRole);
adminRoutes.post("/users/create-admin", admin.createAdmin);

// Listings
adminRoutes.get("/listings", admin.getListings);
adminRoutes.post("/listings/approve", admin.approveListing);
adminRoutes.post("/listings/reject", admin.rejectListing);
adminRoutes.post("/listings/delete", admin.deleteListing);

// Orders
adminRoutes.get("/orders", admin.getOrders);
adminRoutes.post("/orders/force-status", admin.forceOrderStatus);

// Payments / Transactions
adminRoutes.get("/payments", admin.getPayments);
adminRoutes.post("/payments/release", admin.releasePayment);
adminRoutes.post("/payments/refund", admin.refundPayment);
adminRoutes.post("/payments/flag", admin.flagPayment);
adminRoutes.post("/payments/unflag", admin.unflagPayment);

export default adminRoutes;
