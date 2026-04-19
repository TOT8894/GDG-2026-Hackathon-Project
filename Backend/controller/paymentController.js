import Payment from "../models/paymentModel.js";
import User from "../models/userModel.js";
import Entry from "../models/entryModel.js";
import mongoose from "mongoose";
import crypto from "crypto";
import { errorGenerator } from "../utils/error.util.js";

// If requires usage of telebirr we will only create a payment and 
// update the status to pending and validate if the users exist only
// and then we will send a request to telebirr to complete the payment
// and update the status to completed
export const createPayment = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    // We start the transaction here and if anything wrong occurs we abort the transaction
    session.startTransaction();

    const { amount, paymentMethod, description, receiverId } = req.body;
    const senderId = req.user.id;

    // Create a 30-second time window hash for duplicate prevention
    const timeWindow = Math.floor(Date.now() / 30000);
    const reference = crypto.createHash('sha256')
      .update(`${senderId}-${receiverId}-${amount}-${timeWindow}`)
      .digest('hex');

    // Duplicate Prevention Check
    const existingPayment = await Payment.findOne({ reference }).session(session);
    if (existingPayment) {
      await session.abortTransaction();
      return res.status(200).json({
        success: true,
        data: existingPayment,
        message: "Payment already processed, wait for 30 seconds to try again"
      });
    }

    if (senderId === receiverId) {
      throw errorGenerator("Cannot send money to yourself", 400);
    }

    // Validate Sender Balance
    const sender = await User.findById(senderId).session(session);
    if (!sender || sender.balance < amount) {
      throw errorGenerator("Insufficient balance", 400);
    }

    const receiver = await User.findById(receiverId).session(session);
    if (!receiver) {
      throw errorGenerator("Receiver not found", 404);
    }

    // Create Transfer Record
    const payment = new Payment({
      senderId,
      receiverId,
      amount,
      paymentMethod,
      description,
      reference,
      status: "completed"
    });
    
    // Create Entry Objects (Leger)
    const senderEntry = new Entry({
      senderId,
      paymentId: payment._id,
      amount: -amount,
      type: "debit",
      description: `Transfer to ${receiverId}`,
      balanceBefore: sender.balance,
      balanceAfter: sender.balance - amount
    });

    

    const receiverEntry = new Entry({
      senderId: receiverId,
      paymentId: payment._id,
      amount: amount,
      type: "credit",
      description: `Transfer from ${senderId}`,
      balanceBefore: receiver.balance,
      balanceAfter: receiver.balance + amount
    });

    

    // Update Balances
    sender.balance -= amount;
    receiver.balance += amount;

    // Save all documents
    await payment.save({ session });
    await Entry.insertMany([senderEntry, receiverEntry], { session });
    await sender.save({ session });
    await receiver.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: {
        payment: payment,
        senderEntry: senderEntry,
        receiverEntry: receiverEntry
      }
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const senderId = req.user.id;

    const payment = await Payment.findOne({ _id: id, senderId });

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
    const senderId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { senderId };
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

// For future features like integration with telebirr and other vendors
// export const updatePaymentStatus = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     const { id } = req.params;
//     const { status, failureReason } = req.body;
//     const senderId = req.user.id;

//     const payment = await Payment.findOne({ _id: id, senderId }).session(session);

//     if (!payment) {
//       await session.abortTransaction();
//       return res.status(404).json({
//         success: false,
//         message: "Payment not found"
//       });
//     }

//     const validTransitions = {
//       pending: ["processing", "cancelled"],
//       processing: ["completed", "failed", "cancelled"],
//       completed: [],
//       failed: ["pending"],
//       cancelled: ["pending"]
//     };

//     if (!validTransitions[payment.status].includes(status)) {
//       await session.abortTransaction();
//       return res.status(400).json({
//         success: false,
//         message: `Cannot transition from ${payment.status} to ${status}`
//       });
//     }

//     payment.status = status;
//     if (failureReason) payment.failureReason = failureReason;

//     await payment.save({ session });

//     await session.commitTransaction();

//     res.json({
//       success: true,
//       data: payment
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     console.error("Update payment status error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update payment status"
//     });
//   } finally {
//     session.endSession();
//   }
// };

