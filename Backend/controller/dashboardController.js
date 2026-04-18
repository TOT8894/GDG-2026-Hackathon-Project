import Listing from "../models/listingModel";
import Order from "../models/orderModel";
import User from "../models/userModel";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalListings = await Listing.countDocuments({ sellerId: userId });
    const totalOrders = await Order.countDocuments({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    });

    const totalSales = await Order.aggregate([
      { $match: { sellerId: userId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const user = await User.findById(userId);

    res.json({
      totalListings,
      totalOrders,
      totalSales: totalSales[0]?.total || 0,
      trustScore: user.trustScore,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};