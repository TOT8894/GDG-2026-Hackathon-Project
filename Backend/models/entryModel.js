import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ["debit", "credit"],
      required: true
    },
    description: String,
    balanceBefore: Number,
    balanceAfter: Number
  },
  {
    timestamps: true
  }
);

entrySchema.index({ userId: 1, createdAt: -1 });

const Entry = mongoose.model("Entry", entrySchema);
export default Entry;
