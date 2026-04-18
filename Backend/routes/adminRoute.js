import express from "express";
const router = express.Router();
import admin from "../controller/adminController";
import auth from "../middleware/authentication";
import authorize from "../middleware/autherization";

router.get("/users", auth, authorize("admin"), admin.getUsers);
router.post("/users/ban", auth, authorize("admin"), admin.banUser);

router.get("/listings", auth, authorize("admin"), admin.getListings);
router.post("/listings/approve", auth, authorize("admin"), admin.approveListing);
router.post("/listings/reject", auth, authorize("admin"), admin.rejectListing);

router.get("/reports", auth, authorize("admin"), admin.getReports);

export default router;