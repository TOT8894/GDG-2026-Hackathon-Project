import express from "express";
const router = express.Router();
import seller from "../controller/sellerController.js";
import authenticateAccessToken from "../middleware/authentication.js";

router.post("/listings", authenticateAccessToken, seller.createListing);
router.put("/listings/:id", authenticateAccessToken, seller.updateListing);
router.delete("/listings/:id", authenticateAccessToken, seller.deleteListing);
router.patch("/listings/:id/sold", authenticateAccessToken, seller.markAsSold);
router.get("/orders", authenticateAccessToken, seller.getSellerOrders);

export default router;