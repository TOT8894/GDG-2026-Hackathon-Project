import express from "express";
const router = express.Router();
import { getDashboard } from "../controller/dashboardController";
import auth from "../middleware/authentication";

router.get("/", auth, getDashboard);

export default router;