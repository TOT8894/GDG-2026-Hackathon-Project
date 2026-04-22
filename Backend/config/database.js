import mongoose from "mongoose";
import { MONGO_URI } from "./env.js";
const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not set. Add it to Backend/.env");
    }

    const connect = await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB", connect.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    throw error;
  }
};

export default connectDB;
