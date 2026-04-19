import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: "BIRR",
      uppercase: true
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["card", "bank_transfer", "wallet", "mobile_money"]
    },
    reference: {
      type: String,
      unique: true,
      required: true
    },
    description: String,
    failureReason: String
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ reference: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;