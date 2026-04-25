import crypto from "crypto";
import mongoose from "mongoose";
import Listing from "../models/listingModel.js";
import Notification from "../models/notificationModel.js";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";

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
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
});

const updatePaymentStatus = async ({
  paymentId,
  status,
  req,
  successMessage,
  onBeforeSave,
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!isValidObjectId(paymentId)) {
      await session.abortTransaction();
      return { statusCode: 400, body: { message: "Valid paymentId is required" } };
    }

    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) {
      await session.abortTransaction();
      return { statusCode: 404, body: { message: "Payment not found" } };
    }

    const order = await Order.findById(payment.orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return { statusCode: 404, body: { message: "Order not found" } };
    }

    const isParticipant =
      String(payment.buyerId) === String(req.user._id) ||
      String(payment.sellerId) === String(req.user._id) ||
      req.user.role === "admin";

    if (!isParticipant) {
      await session.abortTransaction();
      return { statusCode: 403, body: { message: "You are not allowed to update this payment" } };
    }

    if (onBeforeSave) {
      const earlyResult = await onBeforeSave({ payment, order, session });
      if (earlyResult) {
        await session.abortTransaction();
        return earlyResult;
      }
    }

    payment.status = status;
    await payment.save({ session });

    await Notification.insertMany(
      [
        {
          userId: payment.buyerId,
          title: "Payment Updated",
          message: `Payment status changed to ${status}`,
          type: "payment",
          relatedId: payment._id,
        },
        {
          userId: payment.sellerId,
          title: "Payment Updated",
          message: `Payment status changed to ${status}`,
          type: "payment",
          relatedId: payment._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return {
      statusCode: 200,
      body: {
        message: successMessage,
        data: buildPaymentResponse(payment),
      },
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const initiatePayment = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { orderId, amount, method } = req.body;

    if (!orderId || !isValidObjectId(orderId)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Valid orderId is required" });
    }

    if (!method) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Payment method is required" });
    }

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(order.buyerId) !== String(req.user._id) && req.user.role !== "admin") {
      await session.abortTransaction();
      return res.status(403).json({ message: "You are not allowed to pay for this order" });
    }

    if (order.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Payment can only be initiated for pending orders" });
    }

    const paymentAmount = amount ?? order.price;
    if (Number(paymentAmount) !== Number(order.price)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Payment amount must match the order price" });
    }

    const existingPayment = await Payment.findOne({
      orderId,
      status: { $in: ["pending", "held"] },
    }).session(session);

    if (existingPayment) {
      await session.abortTransaction();
      return res.status(409).json({
        message: "A payment already exists for this order",
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

    await Notification.insertMany(
      [
        {
          userId: order.buyerId,
          title: "Payment Initiated",
          message: "Your payment has been placed in escrow",
          type: "payment",
          relatedId: payment._id,
        },
        {
          userId: order.sellerId,
          title: "Payment Held",
          message: "A buyer has paid and the funds are in escrow",
          type: "payment",
          relatedId: payment._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return res.status(201).json({
      message: "Payment initiated",
      data: buildPaymentResponse(payment),
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const confirmPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const result = await updatePaymentStatus({
      paymentId,
      status: "held",
      req,
      successMessage: "Payment confirmed",
      onBeforeSave: async ({ payment, order, session }) => {
        if (!["pending", "held"].includes(payment.status)) {
          return {
            statusCode: 400,
            body: { message: `Cannot confirm a payment with status ${payment.status}` },
          };
        }

        order.status = "paid";
        order.paymentId = payment._id;
        await order.save({ session });
        return null;
      },
    });

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const releasePayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const result = await updatePaymentStatus({
      paymentId,
      status: "released",
      req,
      successMessage: "Funds released to seller",
      onBeforeSave: async ({ payment, order, session }) => {
        if (payment.status !== "held") {
          return { statusCode: 400, body: { message: "Only held payments can be released" } };
        }

        if (String(order.buyerId) !== String(req.user._id) && req.user.role !== "admin") {
          return {
            statusCode: 403,
            body: { message: "Only the buyer or admin can release this payment" },
          };
        }

        order.status = "completed";
        await order.save({ session });
        await Listing.findByIdAndUpdate(order.listingId, { status: "sold" }, { session });
        return null;
      },
    });

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const result = await updatePaymentStatus({
      paymentId,
      status: "refunded",
      req,
      successMessage: "Payment refunded",
      onBeforeSave: async ({ payment, order, session }) => {
        if (!["pending", "held"].includes(payment.status)) {
          return {
            statusCode: 400,
            body: { message: "Only pending or held payments can be refunded" },
          };
        }

        order.status = "cancelled";
        await order.save({ session });
        await Listing.findByIdAndUpdate(order.listingId, { status: "active" }, { session });
        return null;
      },
    });

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid payment id is required",
      });
    }

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const isParticipant =
      String(payment.buyerId) === String(req.user._id) ||
      String(payment.sellerId) === String(req.user._id) ||
      req.user.role === "admin";

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    return res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve payment",
    });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {
      $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }],
    };
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    return res.json({
      success: true,
      data: payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve payments",
    });
  }
};

export const createPayment = initiatePayment;
export const getUserPayments = getPaymentHistory;
