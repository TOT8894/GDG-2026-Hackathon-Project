import User from "../models/userModel.js";
import  Listing from "../models/listingModel.js"

export const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

export const banUser = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );

  res.json(user);
};

export const getListings = async (req, res) => {
  const listings = await Listing.find();
  res.json(listings);
};

export const approveListing = async (req, res) => {
  const { listingId } = req.body;

  const listing = await Listing.findByIdAndUpdate(
    listingId,
    { status: "active" },
    { new: true }
  );

  res.json(listing);
};

export const rejectListing = async (req, res) => {
  const { listingId } = req.body;

  const listing = await Listing.findByIdAndUpdate(
    listingId,
    { status: "rejected" },
    { new: true }
  );

  res.json(listing);
};

export const getReports = async (req, res) => {
  res.json({ message: "Reports system placeholder" });
};