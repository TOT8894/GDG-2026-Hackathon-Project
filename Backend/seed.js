import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/userModel.js";
import Listing from "./models/listingModel.js";
import ChatMessage from "./models/chatModel.js";
import Order from "./models/orderModel.js";
import Cart from "./models/cartModel.js";
import Payment from "./models/paymentModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI||mongodb+srv://shanbeldires:shanbel@cluster0.aphrwsa.mongodb.net/Digital-Kuralew?retryWrites=true&w=majority
;

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Create Users
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const admin = await User.create({
      fullName: "Admin User",
      email: "admin@kuralew.com",
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true,
      isVerified: true,
      trustScore: 100,
    });

    const seller1 = await User.create({
      fullName: "John Seller",
      email: "john@kuralew.com",
      password: hashedPassword,
      role: "seller",
      isEmailVerified: true,
      isVerified: true,
      trustScore: 85,
      phone: "+251912345678",
      location: { latitude: 9.032, longitude: 38.746 },
    });

    const seller2 = await User.create({
      fullName: "Mary Seller",
      email: "mary@kuralew.com",
      password: hashedPassword,
      role: "seller",
      isEmailVerified: true,
      isVerified: true,
      trustScore: 90,
      phone: "+251912345679",
      location: { latitude: 9.005, longitude: 38.763 },
    });

    const buyer1 = await User.create({
      fullName: "Alex Buyer",
      email: "alex@kuralew.com",
      password: hashedPassword,
      role: "buyer",
      isEmailVerified: true,
      isVerified: true,
      trustScore: 75,
      phone: "+251912345680",
    });

    const buyer2 = await User.create({
      fullName: "Sarah Buyer",
      email: "sarah@kuralew.com",
      password: hashedPassword,
      role: "buyer",
      isEmailVerified: true,
      isVerified: true,
      trustScore: 80,
      phone: "+251912345681",
    });

    console.log("Created users:", { admin: admin._id, seller1: seller1._id, seller2: seller2._id, buyer1: buyer1._id, buyer2: buyer2._id });

    // Create Listings
    const listings = await Listing.insertMany([
      {
        title: "iPhone 14 Pro Max - 256GB",
        description: "Latest iPhone in excellent condition. Includes original box and charger. Battery health 95%.",
        price: 85000,
        category: "Electronics",
        condition: "used",
        currency: "ETB",
        sellerId: seller1._id,
        images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400"],
        location: { latitude: 9.032, longitude: 38.746, address: "Addis Ababa, Bole" },
        status: "active",
      },
      {
        title: "MacBook Pro M2 - 2023",
        description: "Apple MacBook Pro with M2 chip, 16GB RAM, 512GB SSD. Like new condition.",
        price: 120000,
        category: "Electronics",
        condition: "new",
        currency: "ETB",
        sellerId: seller1._id,
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"],
        location: { latitude: 9.025, longitude: 38.758, address: "Addis Ababa, Kazanchis" },
        status: "active",
      },
      {
        title: "Nike Air Max 270",
        description: "Original Nike Air Max 270, size 42. Comfortable and stylish.",
        price: 8500,
        category: "Clothing",
        condition: "new",
        currency: "ETB",
        sellerId: seller2._id,
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"],
        location: { latitude: 9.018, longitude: 38.742, address: "Addis Ababa, Piassa" },
        status: "active",
      },
      {
        title: "Sony WH-1000XM5 Headphones",
        description: "Premium noise-canceling headphones. Excellent sound quality and battery life.",
        price: 25000,
        category: "Electronics",
        condition: "used",
        currency: "ETB",
        sellerId: seller2._id,
        images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400"],
        location: { latitude: 9.008, longitude: 38.756, address: "Addis Ababa, CMC" },
        status: "active",
      },
      {
        title: "Dining Table - 6 Seater",
        description: "Beautiful wooden dining table, seats 6. Excellent condition.",
        price: 35000,
        category: "Home & Garden",
        condition: "used",
        currency: "ETB",
        sellerId: seller1._id,
        images: ["https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400"],
        location: { latitude: 9.015, longitude: 38.738, address: "Addis Ababa, Gerbi" },
        status: "active",
      },
      {
        title: "Samsung 55 inch Smart TV",
        description: "4K UHD Smart TV with HDR. Perfect for home entertainment.",
        price: 65000,
        category: "Electronics",
        condition: "used",
        currency: "ETB",
        sellerId: seller2._id,
        images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400"],
        location: { latitude: 9.032, longitude: 38.746, address: "Addis Ababa, Bole" },
        status: "active",
      },
      {
        title: "Mountain Bike - Trek",
        description: "Professional mountain bike, great for trails and city riding.",
        price: 45000,
        category: "Sports",
        condition: "used",
        currency: "ETB",
        sellerId: seller1._id,
        images: ["https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400"],
        location: { latitude: 9.028, longitude: 38.752, address: "Addis Ababa, Megenagna" },
        status: "active",
      },
      {
        title: "Python Programming Book",
        description: "Learn Python the Hard Way. Brand new, never used.",
        price: 1500,
        category: "Books",
        condition: "new",
        currency: "ETB",
        sellerId: seller2._id,
        images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"],
        location: { latitude: 9.022, longitude: 38.748, address: "Addis Ababa, Stadium" },
        status: "active",
      },
    ]);

    console.log("Created listings:", listings.length);

    // Create Cart Items (each user has one cart with multiple items)
    await Cart.create([
      {
        userId: buyer1._id,
        items: [
          { listingId: listings[0]._id, quantity: 1, price: 85000 },
          { listingId: listings[3]._id, quantity: 1, price: 25000 },
        ],
        totalAmount: 110000,
      },
      {
        userId: buyer2._id,
        items: [
          { listingId: listings[2]._id, quantity: 2, price: 8500 },
        ],
        totalAmount: 17000,
      },
    ]);

    console.log("Created cart items");

    // Create Orders
    const orders = await Order.insertMany([
      {
        buyerId: buyer1._id,
        sellerId: seller1._id,
        listingId: listings[0]._id,
        quantity: 1,
        totalPrice: 85000,
        status: "delivered",
        paymentStatus: "paid",
        shippingAddress: "Addis Ababa, Bole",
        buyerPhone: "+251912345680",
      },
      {
        buyerId: buyer2._id,
        sellerId: seller2._id,
        listingId: listings[3]._id,
        quantity: 1,
        totalPrice: 25000,
        status: "shipped",
        paymentStatus: "paid",
        shippingAddress: "Addis Ababa, CMC",
        buyerPhone: "+251912345681",
      },
      {
        buyerId: buyer1._id,
        sellerId: seller1._id,
        listingId: listings[4]._id,
        quantity: 1,
        totalPrice: 35000,
        status: "pending",
        paymentStatus: "pending",
        shippingAddress: "Addis Ababa, Gerbi",
        buyerPhone: "+251912345680",
      },
    ]);

    console.log("Created orders:", orders.length);

    // Create Payments
    await Payment.insertMany([
      {
        buyerId: buyer1._id,
        orderId: orders[0]._id,
        amount: 85000,
        currency: "ETB",
        method: "telebirr",
        status: "completed",
        transactionRef: "PAY-001-" + Date.now(),
      },
      {
        buyerId: buyer2._id,
        orderId: orders[1]._id,
        amount: 25000,
        currency: "ETB",
        method: "banktransfer",
        status: "completed",
        transactionRef: "PAY-002-" + Date.now(),
      },
    ]);

    console.log("Created payments");

    // Create Chat Messages
    await ChatMessage.insertMany([
      {
        senderId: buyer1._id,
        receiverId: seller1._id,
        listingId: listings[0]._id,
        message: "Hi, is the iPhone still available?",
        status: "seen",
      },
      {
        senderId: seller1._id,
        receiverId: buyer1._id,
        listingId: listings[0]._id,
        message: "Yes, it's still available!",
        status: "seen",
      },
      {
        senderId: buyer1._id,
        receiverId: seller1._id,
        listingId: listings[0]._id,
        message: "Can I get it for 80000 ETB?",
        status: "seen",
      },
      {
        senderId: buyer2._id,
        receiverId: seller2._id,
        listingId: listings[2]._id,
        message: "Do you have these in size 43?",
        status: "delivered",
      },
    ]);

    console.log("Created chat messages");

    console.log("\n✅ Seed completed successfully!");
    console.log("\nTest accounts:");
    console.log("  Admin: admin@kuralew.com / password123");
    console.log("  Seller: john@kuralew.com / password123");
    console.log("  Seller: mary@kuralew.com / password123");
    console.log("  Buyer: alex@kuralew.com / password123");
    console.log("  Buyer: sarah@kuralew.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
