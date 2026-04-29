import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import errorHandler from "./middleware/errorHandler.js";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/authRoute.js";
import chatRoutes from "./routes/chatRoute.js";
import paymentRoutes from "./routes/paymentsRoute.js";
import notificationRoutes from "./routes/notificationRoute.js";
import sellerRoutes from "./routes/sellerRoute.js";
import adminRoutes from "./routes/adminRoute.js";
import buyerRoutes from "./routes/buyerRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import reviewRoutes from "./routes/reviewRoute.js";
import cartRoutes from "./routes/cartRoute.js";

const app = express();

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
        if (origin === process.env.CLIENT_URL) return callback(null, true);
        callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));
app.use(helmet({ crossOriginResourcePolicy: false }));

app.get("/api/v1/health", (_req, res) => res.json({ status: "ok", time: new Date() }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/seller", sellerRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/buyer", buyerRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/cart", cartRoutes);

app.use(errorHandler);

export default app;
