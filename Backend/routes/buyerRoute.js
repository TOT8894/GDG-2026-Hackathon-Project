import express from "express";
const buyerRoutes = express.Router();
import buyer from "../controller/buyerController.js";
import { authenticateAccessToken } from "../middleware/authentication.js";

// Public — no auth needed to browse
buyerRoutes.get("/listings", buyer.getListings);
buyerRoutes.get("/listings/:id", buyer.getListingById);

// Auth required
buyerRoutes.post("/orders/create", authenticateAccessToken, buyer.createOrder);
buyerRoutes.post("/payments/initiate", authenticateAccessToken, buyer.initiatePayment);

export default buyerRoutes;
