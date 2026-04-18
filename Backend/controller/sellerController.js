import Listing from "../models/listingModel";
import Order from "../models/orderModel";

export const createListing = async (req, res) => {
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

export const updateListing = async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(listing);
};

export const deleteListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

export const markAsSold = async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { status: "sold" },
    { new: true }
  );
  res.json(listing);
};

export const getSellerOrders = async (req, res) => {
  const orders = await Order.find({ sellerId: req.user.id });
  res.json(orders);
};exports
exports
exports
exports
exports