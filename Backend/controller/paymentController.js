import crypto from "crypto";
import mongoose from "mongoose";
import Listing from "../models/listingModel.js";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import User from "../models/userModel.js";
import { notify } from "../utils/notify.js";
import { sendPaymentPromoCode, sendPaymentReceivedEmail } from "../utils/emailService.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildPaymentResponse = (payment) => ({
  _id: payment._id,
  orderId: payment.orderId,
  buyerId: payment.buyerId,
  sellerId: payment.sellerId,
  amount: payment.amount,
  currency: payment.currency,
  status: payment.status,
  method: payment.method,
  escrow: payment.escrow,
  transactionRef: payment.transactionRef,
  isFlagged: payment.isFlagged,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
});

// ─── Initiate / Create Payment ───────────────────────────────────────────────
export const initiatePayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { orderId, amount, method } = req.body;

    // Email must be verified before paying
    if (!req.user.isEmailVerified) {
      await session.abortTransaction();
      return res.status(403).json({
        error: "Email verification required before making payments. Please verify your email first.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    if (!orderId || !isValidObjectId(orderId)) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Valid orderId is required" });
    }

    if (!method) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Payment method is required" });
    }

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Order not found" });
    }

    if (String(order.buyerId) !== String(req.user._id) && req.user.role !== "admin") {
      await session.abortTransaction();
      return res.status(403).json({ error: "You are not allowed to pay for this order" });
    }

    if (order.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({ error: "Payment can only be initiated for pending orders" });
    }

    const paymentAmount = amount ?? order.price;

    const existingPayment = await Payment.findOne({
      orderId,
      status: { $in: ["pending", "held"] },
    }).session(session);

    if (existingPayment) {
      await session.abortTransaction();
      return res.status(409).json({
        error: "A payment already exists for this order",
        data: buildPaymentResponse(existingPayment),
      });
    }

    const transactionRef = `TXN-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

    const payment = new Payment({
      orderId: order._id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      amount: paymentAmount,
      currency: "ETB",
      status: "held",
      method,
      escrow: true,
      transactionRef,
      reference: transactionRef,
    });
    await payment.save({ session });

    order.paymentId = payment._id;
    order.status = "paid";
    await order.save({ session });

    await session.commitTransaction();

    // Send emails and notifications outside transaction
    const [buyer, seller, listing] = await Promise.all([
      User.findById(order.buyerId).select("fullName email"),
      User.findById(order.sellerId).select("fullName email"),
      Listing.findById(order.listingId).select("title"),
    ]);

    await Promise.all([
      // Email buyer with promo code confirmation
      sendPaymentPromoCode(buyer?.email, {
        promoCode: req.body.promoCode || null,
        amount: paymentAmount,
        method,
        transactionRef,
        buyerName: buyer?.fullName || "Buyer",
      }),
      // Email seller that payment was received
      sendPaymentReceivedEmail(seller?.email, {
        amount: paymentAmount,
        buyerName: buyer?.fullName || "Buyer",
        listingTitle: listing?.title || "Your listing",
        transactionRef,
        orderId: order._id,
      }),
      // In-app notifications
      notify([
        {
          userId: order.buyerId,
          title: "Payment Successful",
          message: `Your payment of ${paymentAmount} ETB via ${method} is held in escrow.`,
          type: "payment",
          link: `/orders/${order._id}`,
          relatedId: payment._id,
        },
        {
          userId: order.sellerId,
          title: "New Payment Received",
          message: `A buyer paid ${paymentAmount} ETB for your listing. Funds are in escrow.`,
          type: "payment",
          link: `/orders/${order._id}`,
          relatedId: payment._id,
        },
      ]),
    ]);

    return res.status(201).json({
      message: "Payment initiated successfully. Funds held in escrow.",
      data: buildPaymentResponse(payment),
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// ─── Release Payment (buyer confirms delivery) ───────────────────────────────
export const releasePayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { paymentId } = req.body;
    if (!isValidObjectId(paymentId)) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Valid paymentId is required" });
    }

    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Payment not found" });
    }

    if (payment.status !== "held") {
      await session.abortTransaction();
      return res.status(400).json({ error: "Only held payments can be released" });
    }

    const isBuyer = String(payment.buyerId) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isBuyer && !isAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ error: "Only the buyer or admin can release payment" });
    }

    payment.status = "released";
    await payment.save({ session });

    const order = await Order.findByIdAndUpdate(payment.orderId, { status: "completed" }, { session, new: true });
    if (order) await Listing.findByIdAndUpdate(order.listingId, { status: "sold" }, { session });

    await session.commitTransaction();

    await notify([
      {
        userId: payment.sellerId,
        title: "Payment Released!",
        message: `${payment.amount} ETB has been released to your account.`,
        type: "payment",
        link: `/orders/${payment.orderId}`,
        relatedId: payment._id,
      },
      {
        userId: payment.buyerId,
        title: "Order Completed",
        message: "You confirmed delivery. The order is now complete.",
        type: "order",
        link: `/orders/${payment.orderId}`,
        relatedId: payment._id,
      },
    ]);

    return res.status(200).json({ message: "Payment released to seller", data: buildPaymentResponse(payment) });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// ─── Refund Payment ──────────────────────────────────────────────────────────
export const refundPayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { paymentId } = req.body;
    if (!isValidObjectId(paymentId)) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Valid paymentId is required" });
    }

    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Payment not found" });
    }

    if (!["pending", "held"].includes(payment.status)) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Cannot refund this payment" });
    }

    const isParticipant =
      String(payment.buyerId) === String(req.user._id) ||
      String(payment.sellerId) === String(req.user._id) ||
      req.user.role === "admin";
    if (!isParticipant) {
      await session.abortTransaction();
      return res.status(403).json({ error: "Unauthorized" });
    }

    payment.status = "refunded";
    await payment.save({ session });

    const order = await Order.findByIdAndUpdate(payment.orderId, { status: "cancelled" }, { session, new: true });
    if (order) await Listing.findByIdAndUpdate(order.listingId, { status: "active" }, { session });

    await session.commitTransaction();

    await notify([
      {
        userId: payment.buyerId,
        title: "Refund Processed",
        message: `${payment.amount} ETB has been refunded to you.`,
        type: "payment",
        link: `/orders/${payment.orderId}`,
        relatedId: payment._id,
      },
      {
        userId: payment.sellerId,
        title: "Order Refunded",
        message: "A payment was refunded. The listing is active again.",
        type: "payment",
        link: `/orders/${payment.orderId}`,
        relatedId: payment._id,
      },
    ]);

    return res.status(200).json({ message: "Payment refunded", data: buildPaymentResponse(payment) });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// ─── Confirm Payment ─────────────────────────────────────────────────────────
export const confirmPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    if (!isValidObjectId(paymentId)) return res.status(400).json({ error: "Valid paymentId is required" });

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (!["pending"].includes(payment.status)) return res.status(400).json({ error: "Cannot confirm this payment" });

    payment.status = "held";
    await payment.save();

    await Order.findByIdAndUpdate(payment.orderId, { status: "paid", paymentId: payment._id });

    return res.status(200).json({ message: "Payment confirmed", data: buildPaymentResponse(payment) });
  } catch (error) {
    next(error);
  }
};

// ─── Get Payment by ID ───────────────────────────────────────────────────────
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Valid payment id is required" });

    const payment = await Payment.findById(id)
      .populate("buyerId", "fullName email")
      .populate("sellerId", "fullName email")
      .populate("orderId");

    if (!payment) return res.status(404).json({ error: "Payment not found" });

    const isParticipant =
      String(payment.buyerId._id) === String(req.user._id) ||
      String(payment.sellerId._id) === String(req.user._id) ||
      req.user.role === "admin";

    if (!isParticipant) return res.status(403).json({ error: "Unauthorized" });

    return res.json({ data: payment });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ─── Get Payment History ─────────────────────────────────────────────────────
export const getPaymentHistory = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }] };
    if (status) query.status = status;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("orderId", "status listingId")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Payment.countDocuments(query),
    ]);

    return res.json({ data: payments, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createPayment = initiatePayment;
export const getUserPayments = getPaymentHistory;
