import express from "express";
const router = express.Router();
import seller from "../controller/sellerController";
import auth from "../middleware/authentication";

router.post("/listings", auth, seller.createListing);
router.put("/listings/:id", auth, seller.updateListing);
router.delete("/listings/:id", auth, seller.deleteListing);
router.patch("/listings/:id/sold", auth, seller.markAsSold);
router.get("/orders", auth, seller.getSellerOrders);

export default router;