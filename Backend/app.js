import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import errorHandler from "./middleware/errorHandler.js";
import dotenv from "dotenv";
dotenv.config();
import { CLIENT_URL } from "./config/env.js";
import authRoutes from "./routes/authRoute.js";
import chatRoutes from "./routes/chatRoute.js";
import paymentRoutes from "./routes/paymentsRoute.js";

const app = express();

// Middlewares
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet())

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/payments", paymentRoutes);

// Error handler
app.use(errorHandler);

export default app;
