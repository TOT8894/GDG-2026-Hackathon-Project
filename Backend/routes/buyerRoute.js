import express from "express";
const router = express.Router();
import buyer from "../controller/buyerController.js";
import authenticateAccessToken from "../middleware/authentication.js";

router.get("/listings", authenticateAccessToken, buyer.getListings);
router.post("/orders/create", authenticateAccessToken, buyer.createOrder);
router.post("/payments/initiate", authenticateAccessToken, buyer.initiatePayment);

export default router;