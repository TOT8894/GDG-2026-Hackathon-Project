import User from "../models/userModel.js";
import Listing from "../models/listingModel.js";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import bcrypt from "bcrypt";
import { notify } from "../utils/notify.js";

// ─── Dashboard Stats ────────────────────────────────────────────────────────

export const getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers, newUsersThisMonth, newUsersLastMonth,
      totalListings, activeListings, pendingListings,
      totalOrders, ordersThisMonth,
      totalPayments, heldPayments,
      revenueAgg, revenueLastMonthAgg,
      bannedUsers, verifiedUsers,
      buyerCount, sellerCount, adminCount,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: "active" }),
      Listing.countDocuments({ status: "pending" }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Payment.countDocuments(),
      Payment.countDocuments({ status: "held" }),
      Payment.aggregate([{ $match: { status: "released" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Payment.aggregate([{ $match: { status: "released", createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ role: "buyer" }),
      User.countDocuments({ role: "seller" }),
      User.countDocuments({ role: "admin" }),
    ]);

    const revenue = revenueAgg[0]?.total || 0;
    const revenueLastMonth = revenueLastMonthAgg[0]?.total || 0;
    const revenueGrowth = revenueLastMonth > 0
      ? (((revenue - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
      : null;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 }, revenue: { $sum: "$price" } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      data: {
        users: { total: totalUsers, thisMonth: newUsersThisMonth, lastMonth: newUsersLastMonth, banned: bannedUsers, verified: verifiedUsers, buyers: buyerCount, sellers: sellerCount, admins: adminCount },
        listings: { total: totalListings, active: activeListings, pending: pendingListings },
        orders: { total: totalOrders, thisMonth: ordersThisMonth },
        payments: { total: totalPayments, held: heldPayments, revenue, revenueLastMonth, revenueGrowth },
        dailyOrders,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── User Management ────────────────────────────────────────────────────────

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, status } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status === "banned") query.isActive = false;
    if (status === "active") query.isActive = true;
    if (search) query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
    const [users, total] = await Promise.all([
      User.find(query).select("-password -resetPasswordToken -emailVerificationToken")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ data: users, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -resetPasswordToken -emailVerificationToken");
    if (!user) return res.status(404).json({ error: "User not found" });

    const [orders, listings, payments] = await Promise.all([
      Order.countDocuments({ $or: [{ buyerId: user._id }, { sellerId: user._id }] }),
      Listing.countDocuments({ sellerId: user._id }),
      Payment.countDocuments({ $or: [{ buyerId: user._id }, { sellerId: user._id }] }),
    ]);

    res.json({ data: { ...user.toObject(), stats: { orders, listings, payments } } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const banUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    if (userId === req.user._id.toString()) return res.status(400).json({ error: "Cannot ban yourself" });
    const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    await notify({ userId, title: "Account Suspended", message: `Your account has been suspended. Reason: ${reason || "Policy violation"}`, type: "system" });
    res.json({ message: `User ${user.fullName} banned`, data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    await notify({ userId, title: "Account Restored", message: "Your account has been reinstated. Welcome back!", type: "system" });
    res.json({ message: `User ${user.fullName} unbanned`, data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId === req.user._id.toString()) return res.status(400).json({ error: "Already an admin" });
    const user = await User.findByIdAndUpdate(userId, { role: "admin" }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: `${user.fullName} promoted to admin`, data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!["buyer", "seller", "admin"].includes(role)) return res.status(400).json({ error: "Invalid role" });
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: `Role changed to ${role}`, data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ error: "fullName, email, password required" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already in use" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashed, role: "admin", isEmailVerified: true, isVerified: true });
    res.status(201).json({ message: "Admin account created", data: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Listing Management ─────────────────────────────────────────────────────

export const getListings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { title: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
    const [listings, total] = await Promise.all([
      Listing.find(query).populate("sellerId", "fullName email trustScore")
        .sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit)),
      Listing.countDocuments(query),
    ]);
    res.json({ data: listings, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const approveListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.body.listingId, { status: "active" }, { new: true });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json({ message: "Listing approved", data: listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rejectListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.body.listingId, { status: "rejected" }, { new: true });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json({ message: "Listing rejected", data: listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.body.listingId);
    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Order Management ────────────────────────────────────────────────────────

export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("listingId", "title price images")
        .populate("buyerId", "fullName email")
        .populate("sellerId", "fullName email")
        .populate("paymentId", "status amount method transactionRef")
        .sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ data: orders, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const forceOrderStatus = async (req, res) => {
  try {
    const { orderId, status, reason } = req.body;
    const validStatuses = ["pending", "paid", "shipped", "completed", "cancelled"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true })
      .populate("listingId", "title").populate("buyerId", "fullName").populate("sellerId", "fullName");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: `Order status forced to ${status}. Reason: ${reason || "Admin action"}`, data: order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Payment / Transaction Management ───────────────────────────────────────

export const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, flagged } = req.query;
    const query = {};
    if (status) query.status = status;
    if (flagged === "true") query.isFlagged = true;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("buyerId", "fullName email")
        .populate("sellerId", "fullName email")
        .populate("orderId", "status listingId")
        .sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit)),
      Payment.countDocuments(query),
    ]);
    res.json({ data: payments, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const releasePayment = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status !== "held") return res.status(400).json({ error: "Only held payments can be released" });
    payment.status = "released";
    await payment.save();
    // Also complete the order
    if (payment.orderId) await Order.findByIdAndUpdate(payment.orderId, { status: "completed" });
    res.json({ message: `Payment released to seller. Reason: ${reason || "Admin approval"}`, data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (!["held", "pending"].includes(payment.status)) return res.status(400).json({ error: "Cannot refund this payment" });
    payment.status = "refunded";
    await payment.save();
    if (payment.orderId) await Order.findByIdAndUpdate(payment.orderId, { status: "cancelled" });
    res.json({ message: `Payment refunded to buyer. Reason: ${reason || "Admin decision"}`, data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const flagPayment = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { isFlagged: true, flagReason: reason || "Suspicious activity" },
      { new: true }
    );
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json({ message: "Payment flagged for review", data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const unflagPayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.body.paymentId,
      { isFlagged: false, flagReason: null },
      { new: true }
    );
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json({ message: "Payment unflagged", data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fraud detection: find suspicious patterns
export const getFraudAlerts = async (req, res) => {
  try {
    // 1. Users with many cancelled orders (potential fraud)
    const highCancellations = await Order.aggregate([
      { $match: { status: "cancelled" } },
      { $group: { _id: "$buyerId", count: { $sum: 1 } } },
      { $match: { count: { $gte: 3 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { userId: "$_id", fullName: "$user.fullName", email: "$user.email", cancelledOrders: "$count" } },
      { $sort: { cancelledOrders: -1 } },
      { $limit: 10 },
    ]);

    // 2. Payments held for more than 7 days (potential dispute)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const staleHeldPayments = await Payment.find({ status: "held", createdAt: { $lt: sevenDaysAgo } })
      .populate("buyerId", "fullName email")
      .populate("sellerId", "fullName email")
      .limit(10);

    // 3. Flagged payments
    const flaggedPayments = await Payment.find({ isFlagged: true })
      .populate("buyerId", "fullName email")
      .populate("sellerId", "fullName email")
      .limit(10);

    // 4. Users with multiple accounts (same email pattern — simplified)
    const recentUsers = await User.find({ createdAt: { $gte: sevenDaysAgo } }).select("fullName email role createdAt").limit(20);

    res.json({
      data: {
        highCancellations,
        staleHeldPayments,
        flaggedPayments,
        recentSignups: recentUsers,
        summary: {
          highCancellationUsers: highCancellations.length,
          stalePayments: staleHeldPayments.length,
          flaggedCount: flaggedPayments.length,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  getStats, getUsers, getUserDetail, banUser, unbanUser, promoteToAdmin, changeUserRole, createAdmin,
  getListings, approveListing, rejectListing, deleteListing,
  getOrders, forceOrderStatus,
  getPayments, releasePayment, refundPayment, flagPayment, unflagPayment, getFraudAlerts,
};
