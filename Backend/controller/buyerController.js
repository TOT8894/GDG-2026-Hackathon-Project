import Listing from "../models/listingModel.js";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import Notification from "../models/notificationModel.js"; 

export const getListings = async (req, res) => {
  const listings = await Listing.find({ status: "active" });
  res.json(listings);
};

export const createOrder = async (req, res) => {
  try {
    const { listingId } = req.body;

    const listing = await Listing.findById(listingId);

    const order = await Order.create({
      listingId,
      buyerId: req.user.id,
      sellerId: listing.sellerId,
      price: listing.price,
      status: "pending",
    });

    await Notification.create({
      userId: listing.sellerId,
      title: "New Order",
      message: "You received a new order",
      type: "order",
      relatedId: order._id,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const initiatePayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const payment = await Payment.create({
      orderId,
      buyerId: req.user.id,
      amount,
      status: "held",
      escrow: true,
    });

    await Order.findByIdAndUpdate(orderId, { status: "paid" });

    await Notification.create({
      userId: req.user._id,
      title: "Payment Initiated",
      message: "Your payment is being processed",
      type: "payment",
    });
    
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
