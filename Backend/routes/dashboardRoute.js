import express from "express";
const router = express.Router();
import { getDashboard } from "../controller/dashboardController.js";
import authenticateAccessToken from "../middleware/authentication.js";

router.get("/", authenticateAccessToken, getDashboard);

export default router;