import express from "express";
import {
    createReview,
    getUserReviews,
    getReviewById,
    getMyReviews,
    canReviewOrder,
} from "../controller/reviewController.js";
import { authenticateAccessToken } from "../middleware/authentication.js";

const reviewRoutes = express.Router();

reviewRoutes.post("/", authenticateAccessToken, createReview);
reviewRoutes.get("/my-reviews", authenticateAccessToken, getMyReviews);
reviewRoutes.get("/user/:userId", getUserReviews);
reviewRoutes.get("/can-review/:orderId", authenticateAccessToken, canReviewOrder);
reviewRoutes.get("/:id", getReviewById);

export default reviewRoutes;
