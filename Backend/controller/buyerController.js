import Listing from "../models/listingModel.js";
import { createOrder as createMarketplaceOrder } from "./orderController.js";
import { initiatePayment as initiateMarketplacePayment } from "./paymentController.js";

export const getListings = async (req, res) => {
  try {
    const { search, category, condition, minPrice, maxPrice, sort, limit = 20, page = 1 } = req.query;

    const query = { status: "active" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price-low") sortOption = { price: 1 };
    else if (sort === "price-high") sortOption = { price: -1 };
    else if (sort === "oldest") sortOption = { createdAt: 1 };

    const listings = await Listing.find(query)
      .populate("sellerId", "fullName trustScore avatar")
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Listing.countDocuments(query);

    return res.json({ data: listings, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("sellerId", "fullName trustScore email avatar phone");

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Increment view count
    listing.views = (listing.views || 0) + 1;
    await listing.save();

    return res.json({ data: listing });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createOrder = createMarketplaceOrder;
export const initiatePayment = initiateMarketplacePayment;

export default {
  getListings,
  getListingById,
  createOrder,
  initiatePayment,
};
