import express from "express";
const adminRoutes = express.Router();
import admin from "../controller/adminController.js";
import authenticateAccessToken from "../middleware/authentication.js";
import authorize from "../middleware/autherization.js";

adminRoutes.get("/users", authenticateAccessToken, authorize("admin"), admin.getUsers);
adminRoutes.post("/users/ban", authenticateAccessToken, authorize("admin"), admin.banUser);

adminRoutes.get("/listings", authenticateAccessToken, authorize("admin"), admin.getListings);
adminRoutes.post("/listings/approve", authenticateAccessToken, authorize("admin"), admin.approveListing);
adminRoutes.post("/listings/reject", authenticateAccessToken, authorize("admin"), admin.rejectListing);

adminRoutes.get("/reports", authenticateAccessToken, authorize("admin"), admin.getReports);

export default adminRoutes;
