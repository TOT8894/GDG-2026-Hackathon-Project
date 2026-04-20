import express from "express";
const buyerRoutes = express.Router();
import buyer from "../controller/buyerController.js";
import authenticateAccessToken from "../middleware/authentication.js";
import authorize from "../middleware/autherization.js";
buyerRoutes.get("/listings", authenticateAccessToken, authorize("buyer"), buyer.getListings);
buyerRoutes.post("/orders/create", authenticateAccessToken, authorize("buyer"), buyer.createOrder);
buyerRoutes.post("/payments/initiate", authenticateAccessToken, authorize("buyer"), buyer.initiatePayment);

export default buyerRoutes;
