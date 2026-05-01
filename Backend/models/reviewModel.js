import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true,
        },
        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        reviewedUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        type: {
            type: String,
            enum: ["buyer_to_seller", "seller_to_buyer"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate reviews for same order
reviewSchema.index({ orderId: 1, reviewerId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
