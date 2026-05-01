import express from "express";
import {
    addToCart, getCart, updateCartItem,
    removeFromCart, clearCart, getAllCarts, getCartByUserId,
} from "../controller/cartController.js";
import { authenticateAccessToken } from "../middleware/authentication.js";
import { authorization as authorize } from "../middleware/autherization.js";

const cartRoutes = express.Router();
cartRoutes.use(authenticateAccessToken);

// Admin-only
cartRoutes.get("/all", authorize("admin"), getAllCarts);
cartRoutes.get("/user/:userId", authorize("admin"), getCartByUserId);

// User's own cart
cartRoutes.get("/", getCart);
cartRoutes.post("/", addToCart);
cartRoutes.put("/", updateCartItem);
cartRoutes.delete("/clear", clearCart);
cartRoutes.delete("/:listingId", removeFromCart);

export default cartRoutes;
