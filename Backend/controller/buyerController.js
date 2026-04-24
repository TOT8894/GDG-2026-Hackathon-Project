import Listing from "../models/listingModel.js";
import { createOrder as createMarketplaceOrder } from "./orderController.js";
import { initiatePayment as initiateMarketplacePayment } from "./paymentController.js";

export const getListings = async (req, res) => {
  const listings = await Listing.find({ status: "active" });
  res.json(listings);
};

export const createOrder = createMarketplaceOrder;
export const initiatePayment = initiateMarketplacePayment;

export default {
  getListings,
  createOrder,
  initiatePayment,
};
