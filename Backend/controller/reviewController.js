import mongoose from "mongoose";
import Review from "../models/reviewModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a review
export const createReview = async (req, res) => {
    try {
        const { orderId, reviewedUserId, rating, comment } = req.body;
        const reviewerId = req.user.id;

        if (!orderId || !isValidObjectId(orderId)) {
            return res.status(400).json({ error: "Valid order ID is required" });
        }

        if (!reviewedUserId || !isValidObjectId(reviewedUserId)) {
            return res.status(400).json({ error: "Valid reviewed user ID is required" });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        // Get order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Check if order is completed
        if (order.status !== "completed") {
            return res.status(400).json({ error: "Can only review completed orders" });
        }

        // Check if user is part of the order
        const isBuyer = order.buyerId.toString() === reviewerId;
        const isSeller = order.sellerId.toString() === reviewerId;

        if (!isBuyer && !isSeller) {
            return res.status(403).json({ error: "You are not part of this order" });
        }

        // Validate reviewed user
        if (isBuyer && reviewedUserId !== order.sellerId.toString()) {
            return res.status(400).json({ error: "Buyer can only review seller" });
        }

        if (isSeller && reviewedUserId !== order.buyerId.toString()) {
            return res.status(400).json({ error: "Seller can only review buyer" });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ orderId, reviewerId });
        if (existingReview) {
            return res.status(400).json({ error: "You have already reviewed this order" });
        }

        // Create review
        const review = await Review.create({
            orderId,
            reviewerId,
            reviewedUserId,
            rating,
            comment: comment || "",
            type: isBuyer ? "buyer_to_seller" : "seller_to_buyer",
        });

        await review.populate("reviewerId", "fullName email avatar");
        await review.populate("reviewedUserId", "fullName email avatar");

        // Update trust score
        await updateUserTrustScore(reviewedUserId);

        // Notify reviewed user
        await Notification.create({
            userId: reviewedUserId,
            title: "New Review",
            message: `You received a ${rating}-star review`,
            type: "review",
            relatedId: review._id,
        });

        return res.status(201).json({
            message: "Review created successfully",
            data: review,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Update user trust score based on reviews
async function updateUserTrustScore(userId) {
    try {
        const reviews = await Review.find({ reviewedUserId: userId });

        if (reviews.length === 0) {
            await User.findByIdAndUpdate(userId, { trustScore: 0 });
            return;
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        // Convert 1-5 rating to 0-100 trust score
        const trustScore = Math.round((averageRating / 5) * 100);

        await User.findByIdAndUpdate(userId, { trustScore });
    } catch (error) {
        console.error("Error updating trust score:", error);
    }
}

// Get reviews for a user
export const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({ error: "Valid user ID is required" });
        }

        const skip = (Number(page) - 1) * Number(limit);

        const reviews = await Review.find({ reviewedUserId: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("reviewerId", "fullName email avatar")
            .populate("orderId", "listingId");

        const total = await Review.countDocuments({ reviewedUserId: userId });

        // Calculate stats
        const allReviews = await Review.find({ reviewedUserId: userId });
        const stats = {
            total: allReviews.length,
            average: allReviews.length > 0
                ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
                : 0,
            distribution: {
                5: allReviews.filter(r => r.rating === 5).length,
                4: allReviews.filter(r => r.rating === 4).length,
                3: allReviews.filter(r => r.rating === 3).length,
                2: allReviews.filter(r => r.rating === 2).length,
                1: allReviews.filter(r => r.rating === 1).length,
            },
        };

        return res.status(200).json({
            data: reviews,
            stats,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get review by ID
export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ error: "Valid review ID is required" });
        }

        const review = await Review.findById(id)
            .populate("reviewerId", "fullName email avatar")
            .populate("reviewedUserId", "fullName email avatar")
            .populate("orderId");

        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        return res.status(200).json({ data: review });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get my reviews (reviews I've written)
export const getMyReviews = async (req, res) => {
    try {
        const reviewerId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const reviews = await Review.find({ reviewerId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("reviewedUserId", "fullName email avatar")
            .populate("orderId", "listingId");

        const total = await Review.countDocuments({ reviewerId });

        return res.status(200).json({
            data: reviews,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Check if user can review an order
export const canReviewOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        if (!isValidObjectId(orderId)) {
            return res.status(400).json({ error: "Valid order ID is required" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Check if order is completed
        if (order.status !== "completed") {
            return res.status(200).json({
                canReview: false,
                reason: "Order must be completed",
            });
        }

        // Check if user is part of order
        const isBuyer = order.buyerId.toString() === userId;
        const isSeller = order.sellerId.toString() === userId;

        if (!isBuyer && !isSeller) {
            return res.status(200).json({
                canReview: false,
                reason: "You are not part of this order",
            });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ orderId, reviewerId: userId });
        if (existingReview) {
            return res.status(200).json({
                canReview: false,
                reason: "You have already reviewed this order",
                review: existingReview,
            });
        }

        return res.status(200).json({
            canReview: true,
            reviewType: isBuyer ? "buyer_to_seller" : "seller_to_buyer",
            reviewedUserId: isBuyer ? order.sellerId : order.buyerId,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
