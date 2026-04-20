import express from "express";
const router = express.Router();
import admin from "../controller/adminController.js";
import authenticateAccessToken from "../middleware/authentication.js";
import authorize from "../middleware/autherization.js";

router.get("/users", authenticateAccessToken, authorize("admin"), admin.getUsers);
router.post("/users/ban", authenticateAccessToken, authorize("admin"), admin.banUser);

router.get("/listings", authenticateAccessToken, authorize("admin"), admin.getListings);
router.post("/listings/approve", authenticateAccessToken, authorize("admin"), admin.approveListing);
router.post("/listings/reject", authenticateAccessToken, authorize("admin"), admin.rejectListing);

router.get("/reports", authenticateAccessToken, authorize("admin"), admin.getReports);

export default router;