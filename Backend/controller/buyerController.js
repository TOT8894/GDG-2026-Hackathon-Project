const Listing = require("../models/listingModel");
const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");

exports.getListings = async (req, res) => {
  const listings = await Listing.find({ status: "active" });
  res.json(listings);
};

exports.createOrder = async (req, res) => {
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

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.initiatePayment = async (req, res) => {
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

    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};