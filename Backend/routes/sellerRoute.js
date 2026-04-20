import express from "express";
const sellerRoutes = express.Router();
import seller from "../controller/sellerController.js";
import authenticateAccessToken from "../middleware/authentication.js";

sellerRoutes.post("/listings", authenticateAccessToken, seller.createListing);
sellerRoutes.put("/listings/:id", authenticateAccessToken, seller.updateListing);
sellerRoutes.delete("/listings/:id", authenticateAccessToken, seller.deleteListing);
sellerRoutes.patch("/listings/:id/sold", authenticateAccessToken, seller.markAsSold);
sellerRoutes.get("/orders", authenticateAccessToken, seller.getSellerOrders);

export default sellerRoutes;
