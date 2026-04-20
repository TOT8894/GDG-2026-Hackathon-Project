import express from "express";
const sellerRoutes = express.Router();
import seller from "../controller/sellerController.js";
import authenticateAccessToken from "../middleware/authentication.js";
import authorize from "../middleware/autherization.js";

sellerRoutes.post("/listings", authenticateAccessToken,  authorize("seller"),seller.createListing);
sellerRoutes.put("/listings/:id", authenticateAccessToken,authorize("seller"), seller.updateListing);
sellerRoutes.delete("/listings/:id", authenticateAccessToken, authorize("seller"),seller.deleteListing);
sellerRoutes.patch("/listings/:id/sold", authenticateAccessToken,authorize("seller"), seller.markAsSold);
sellerRoutes.get("/orders", authenticateAccessToken, authorize("seller"),seller.getSellerOrders);

export default sellerRoutes;
