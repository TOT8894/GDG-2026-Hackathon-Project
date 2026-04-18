import express from "express";
const router = express.Router();
import buyer from "../controller/buyerController";
import auth from "../middleware/authentication";

router.get("/listings", auth, buyer.getListings);
router.post("/orders/create", auth, buyer.createOrder);
router.post("/payments/initiate", auth, buyer.initiatePayment);

export default router;