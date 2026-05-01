import express from "express";
import seller from "../controller/sellerController.js";
import { authenticateAccessToken } from "../middleware/authentication.js";
import { authorization as authorize } from "../middleware/autherization.js";

const sellerRoutes = express.Router();
sellerRoutes.use(authenticateAccessToken);

// Allow seller or admin to manage listings
sellerRoutes.get("/listings", authorize("seller", "admin"), seller.getMyListings);
sellerRoutes.post("/listings", authorize("seller", "admin"), seller.createListing);
sellerRoutes.put("/listings/:id", authorize("seller", "admin"), seller.updateListing);
sellerRoutes.delete("/listings/:id", authorize("seller", "admin"), seller.deleteListing);
sellerRoutes.patch("/listings/:id/sold", authorize("seller", "admin"), seller.markAsSold);
sellerRoutes.get("/orders", authorize("seller", "admin"), seller.getSellerOrders);

export default sellerRoutes;
