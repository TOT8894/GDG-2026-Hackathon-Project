import express from "express";
const dashboardRoutes = express.Router();
import { getDashboard } from "../controller/dashboardController.js";
import authenticateAccessToken from "../middleware/authentication.js";

dashboardRoutes.get("/", authenticateAccessToken, getDashboard);

export default dashboardRoutes;
