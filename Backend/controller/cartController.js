import Cart from "../models/cartModel.js";
import Listing from "../models/listingModel.js";

const getUserId = (req) => req.user._id || req.user.id;
const POPULATE = "title price images sellerId condition category";

export const addToCart = async (req, res) => {
    try {
        const { listingId, quantity = 1 } = req.body;
        const userId = getUserId(req);

        if (!listingId) return res.status(400).json({ error: "listingId is required" });

        const listing = await Listing.findById(listingId);
        if (!listing) return res.status(404).json({ error: "Product not found" });
        if (listing.status !== "active") return res.status(400).json({ error: "Product is not available" });
        if (listing.sellerId.toString() === userId.toString())
            return res.status(400).json({ error: "Cannot add your own product to cart" });

        let cart = await Cart.findOne({ userId });
        if (!cart) cart = new Cart({ userId, items: [], totalAmount: 0 });

        const existing = cart.items.find((i) => i.listingId.toString() === listingId.toString());
        if (existing) {
            existing.quantity += Number(quantity);
        } else {
            cart.items.push({ listingId, quantity: Number(quantity), price: listing.price });
        }

        cart.totalAmount = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
        await cart.save();
        await cart.populate("items.listingId", POPULATE);

        return res.status(200).json({ message: "Item added to cart", data: cart });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = getUserId(req);
        let cart = await Cart.findOne({ userId }).populate("items.listingId", POPULATE);
        if (!cart) {
            cart = new Cart({ userId, items: [], totalAmount: 0 });
            await cart.save();
        }
        return res.status(200).json({ data: cart });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Admin: get any user's cart by userId param
export const getCartByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await Cart.findOne({ userId })
            .populate("items.listingId", POPULATE)
            .populate("userId", "fullName email role");
        if (!cart) return res.status(404).json({ error: "Cart not found for this user" });
        return res.status(200).json({ data: cart });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Admin: get all carts
export const getAllCarts = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const carts = await Cart.find({ "items.0": { $exists: true } }) // only non-empty
            .populate("userId", "fullName email role")
            .populate("items.listingId", "title price")
            .sort({ updatedAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Cart.countDocuments({ "items.0": { $exists: true } });
        return res.status(200).json({ data: carts, total });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { listingId, quantity } = req.body;
        const userId = getUserId(req);
        if (!listingId) return res.status(400).json({ error: "listingId is required" });

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        const item = cart.items.find((i) => i.listingId.toString() === listingId.toString());
        if (!item) return res.status(404).json({ error: "Item not in cart" });

        if (Number(quantity) <= 0) {
            cart.items = cart.items.filter((i) => i.listingId.toString() !== listingId.toString());
        } else {
            item.quantity = Number(quantity);
        }

        cart.totalAmount = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
        await cart.save();
        await cart.populate("items.listingId", POPULATE);
        return res.status(200).json({ message: "Cart updated", data: cart });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { listingId } = req.params;
        const userId = getUserId(req);

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        cart.items = cart.items.filter((i) => i.listingId.toString() !== listingId.toString());
        cart.totalAmount = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
        await cart.save();
        await cart.populate("items.listingId", POPULATE);
        return res.status(200).json({ message: "Item removed", data: cart });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = getUserId(req);
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(200).json({ message: "Cart already empty", data: { items: [], totalAmount: 0 } });
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
        return res.status(200).json({ message: "Cart cleared", data: cart });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
