import Payment from "../models/paymentModel.js";
import mongoose from "mongoose";

export const createPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { amount, paymentMethod, description, reference, metadata } = req.body;
    const userId = req.user.id;

    const existingPayment = await Payment.findOne({ reference }).session(session);

    if (existingPayment) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "Payment with this reference already exists"
      });
    }

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const payment = new Payment({
      userId,
      amount,
      paymentMethod,
      description,
      reference,
      transactionId,
      status: "pending",
      metadata: metadata || {}
    });

    await payment.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Payment creation error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate reference detected"
      });
    }

    res.status(500).json({
      success: false,
      message: "Payment processing failed"
    });
  } finally {
    session.endSession();
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: id, userId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment"
    });
  }
};

export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payments"
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;
    const { status, failureReason } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: id, userId }).session(session);

    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const validTransitions = {
      pending: ["processing", "cancelled"],
      processing: ["completed", "failed", "cancelled"],
      completed: [],
      failed: ["pending"],
      cancelled: ["pending"]
    };

    if (!validTransitions[payment.status].includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${payment.status} to ${status}`
      });
    }

    payment.status = status;
    if (failureReason) payment.failureReason = failureReason;

    await payment.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status"
    });
  } finally {
    session.endSession();
  }
};