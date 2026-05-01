import Listing from "../models/listingModel.js";
import Order from "../models/orderModel.js";

export const createListing = async (req, res) => {
  try {
    const { title, description, price, category, condition, images, location } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: "title, description, price, and category are required" });
    }

    // Location is optional — default to Addis Ababa if not provided
    const resolvedLocation = location && location.latitude && location.longitude
      ? location
      : { latitude: 9.03, longitude: 38.74, address: "Addis Ababa, Ethiopia" };

    const listing = await Listing.create({
      title,
      description,
      price: Number(price),
      category,
      condition: condition || "used",
      images: images || [],
      location: resolvedLocation,
      sellerId: req.user._id,
      status: "active",
    });

    await listing.populate("sellerId", "fullName email trustScore");

    return res.status(201).json({ message: "Listing created successfully", data: listing });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!listing) {
      return res.status(404).json({ error: "Listing not found or not yours" });
    }

    const allowed = ["title", "description", "price", "category", "condition", "images", "location", "status"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) listing[field] = req.body[field];
    });

    await listing.save();
    return res.json({ message: "Listing updated", data: listing });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findOneAndDelete({ _id: req.params.id, sellerId: req.user._id });
    if (!listing) {
      return res.status(404).json({ error: "Listing not found or not yours" });
    }
    return res.json({ message: "Listing deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const markAsSold = async (req, res) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.user._id },
      { status: "sold" },
      { new: true }
    );
    if (!listing) {
      return res.status(404).json({ error: "Listing not found or not yours" });
    }
    return res.json({ message: "Marked as sold", data: listing });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ data: listings });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("listingId", "title price images")
      .populate("buyerId", "fullName email");
    return res.json({ data: orders });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export default {
  createListing,
  updateListing,
  deleteListing,
  markAsSold,
  getMyListings,
  getSellerOrders,
};
