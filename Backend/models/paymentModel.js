import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "ETB",
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["pending", "held", "released", "refunded"],
      default: "pending",
    },
    method: {
      type: String,
      required: true,
      enum: ["wallet", "card", "bank"],
    },
    escrow: {
      type: Boolean,
      default: true,
    },
    transactionRef: {
      type: String,
      unique: true,
      required: true,
    },
    reference: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ buyerId: 1, createdAt: -1 });
paymentSchema.index({ sellerId: 1, createdAt: -1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
