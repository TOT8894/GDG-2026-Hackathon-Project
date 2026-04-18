const Listing = require("../models/listingModel");
const Order = require("../models/orderModel");

exports.createListing = async (req, res) => {
  try {
    const listing = await Listing.create({
      ...req.body,
      sellerId: req.user.id,
      status: "pending",
    });

    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateListing = async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(listing);
};

exports.deleteListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

exports.markAsSold = async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { status: "sold" },
    { new: true }
  );
  res.json(listing);
};

exports.getSellerOrders = async (req, res) => {
  const orders = await Order.find({ sellerId: req.user.id });
  res.json(orders);
};