import express from "express";
const buyerRoutes = express.Router();
import buyer from "../controller/buyerController.js";
import authenticateAccessToken from "../middleware/authentication.js";

buyerRoutes.get("/listings", authenticateAccessToken, buyer.getListings);
buyerRoutes.post("/orders/create", authenticateAccessToken, buyer.createOrder);
buyerRoutes.post("/payments/initiate", authenticateAccessToken, buyer.initiatePayment);

export default buyerRoutes;
