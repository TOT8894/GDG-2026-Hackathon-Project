import mongoose from "mongoose";
import Listing from "../models/listingModel.js";
import Notification from "../models/notificationModel.js";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";

const VALID_STATUSES = ["pending", "paid", "shipped", "completed", "cancelled"];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeOrder = (order) => ({
  _id: order._id,
  listingId: order.listingId,
  buyerId: order.buyerId,
  sellerId: order.sellerId,
  price: order.price,
  status: order.status,
  paymentId: order.paymentId,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const canTransitionStatus = ({ currentStatus, nextStatus, userId, buyerId, sellerId, role }) => {
  if (role === "admin") {
    return VALID_STATUSES.includes(nextStatus) && currentStatus !== "completed";
  }

  const userIdString = String(userId);
  const buyerIdString = String(buyerId);
  const sellerIdString = String(sellerId);

  if (userIdString === buyerIdString) {
    return (
      (currentStatus === "pending" && nextStatus === "cancelled") ||
      (currentStatus === "shipped" && nextStatus === "completed")
    );
  }

  if (userIdString === sellerIdString) {
    return (
      (currentStatus === "pending" && nextStatus === "paid") ||
      (currentStatus === "pending" && nextStatus === "cancelled") ||
      (currentStatus === "paid" && nextStatus === "shipped")
    );
  }

  return false;
};

export const createOrder = async (req, res) => {
  try {
    const { listingId, buyerId } = req.body;
    const authenticatedBuyerId = String(req.user._id);

    if (req.user.role !== "buyer" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only buyers can create orders" });
    }

    if (!listingId || !isValidObjectId(listingId)) {
      return res.status(400).json({ message: "Valid listingId is required" });
    }

    if (buyerId && String(buyerId) !== authenticatedBuyerId) {
      return res.status(403).json({ message: "buyerId must match the authenticated user" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.status !== "active") {
      return res.status(400).json({ message: "Only active listings can be ordered" });
    }

    if (String(listing.sellerId) === authenticatedBuyerId) {
      return res.status(400).json({ message: "You cannot order your own listing" });
    }

    const existingOpenOrder = await Order.findOne({
      listingId,
      status: { $in: ["pending", "paid", "shipped", "completed"] },
    });

    if (existingOpenOrder) {
      return res.status(409).json({ message: "An order already exists for this listing" });
    }

    const order = await Order.create({
      listingId,
      buyerId: req.user._id,
      sellerId: listing.sellerId,
      price: listing.price,
      status: "pending",
    });

    await Notification.create({
      userId: listing.sellerId,
      title: "New Order",
      message: `A new order was created for ${listing.title}`,
      type: "order",
      relatedId: order._id,
    });

    return res.status(201).json({
      message: "Order created successfully",
      data: normalizeOrder(order),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {
      $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }],
    };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("listingId", "title price status images category")
      .populate("buyerId", "fullName email role")
      .populate("sellerId", "fullName email role");

    return res.status(200).json({ data: orders });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get orders", error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Valid order id is required" });
    }

    const order = await Order.findById(id)
      .populate("listingId", "title description price currency images category status location")
      .populate("buyerId", "fullName email role")
      .populate("sellerId", "fullName email role")
      .populate("paymentId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isParticipant =
      String(order.buyerId._id) === String(req.user._id) ||
      String(order.sellerId._id) === String(req.user._id) ||
      req.user.role === "admin";

    if (!isParticipant) {
      return res.status(403).json({ message: "You are not allowed to view this order" });
    }

    return res.status(200).json({ data: order });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get order details", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Valid order id is required" });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "A valid order status is required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isParticipant =
      String(order.buyerId) === String(req.user._id) ||
      String(order.sellerId) === String(req.user._id) ||
      req.user.role === "admin";

    if (!isParticipant) {
      return res.status(403).json({ message: "You are not allowed to update this order" });
    }

    if (
      !canTransitionStatus({
        currentStatus: order.status,
        nextStatus: status,
        userId: req.user._id,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        role: req.user.role,
      })
    ) {
      return res.status(400).json({
        message: `Cannot change order status from ${order.status} to ${status}`,
      });
    }

    order.status = status;
    await order.save();

    if (status === "completed") {
      await Listing.findByIdAndUpdate(order.listingId, { status: "sold" });

      if (order.paymentId) {
        await Payment.findByIdAndUpdate(order.paymentId, { status: "released" });
      }
    }

    if (status === "cancelled") {
      await Listing.findByIdAndUpdate(order.listingId, { status: "active" });

      if (order.paymentId) {
        await Payment.findByIdAndUpdate(order.paymentId, { status: "refunded" });
      }
    }

    const notifyUserId =
      String(req.user._id) === String(order.buyerId) ? order.sellerId : order.buyerId;

    await Notification.create({
      userId: notifyUserId,
      title: "Order Status Updated",
      message: `Order status changed to ${status}`,
      type: "order",
      relatedId: order._id,
    });

    return res.status(200).json({
      message: "Order status updated successfully",
      data: normalizeOrder(order),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
};
