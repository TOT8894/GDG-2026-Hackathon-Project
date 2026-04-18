const User = require("../models/userModel");
const Listing = require("../models/listingModel");

exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

exports.banUser = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );

  res.json(user);
};

exports.getListings = async (req, res) => {
  const listings = await Listing.find();
  res.json(listings);
};

exports.approveListing = async (req, res) => {
  const { listingId } = req.body;

  const listing = await Listing.findByIdAndUpdate(
    listingId,
    { status: "active" },
    { new: true }
  );

  res.json(listing);
};

exports.rejectListing = async (req, res) => {
  const { listingId } = req.body;

  const listing = await Listing.findByIdAndUpdate(
    listingId,
    { status: "rejected" },
    { new: true }
  );

  res.json(listing);
};

exports.getReports = async (req, res) => {
  res.json({ message: "Reports system placeholder" });
};