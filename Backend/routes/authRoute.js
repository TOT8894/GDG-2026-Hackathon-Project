import express from "express";
import {
  login,
  signup,
  logOut,
  getMe,
  updateProfile,
  AccessRefreshToken,
 
} from "../controller/authController.js";
import { authenticateAccessToken } from "../middleware/authentication.js";

const authRoutes = express.Router();

authRoutes.post("/login", login);
authRoutes.post("/register", signup);
authRoutes.post("/logout", authenticateAccessToken, logOut);
authRoutes.post("/refresh", AccessRefreshToken);
authRoutes.get("/profile", authenticateAccessToken, getMe);
authRoutes.put("/updateProfile", authenticateAccessToken, updateProfile);

export default authRoutes;
