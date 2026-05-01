import express from "express";
import {
  login,
  signup,
  logOut,
  getMe,
  updateProfile,
  AccessRefreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  uploadAvatar,
} from "../controller/authController.js";
import { authenticateAccessToken } from "../middleware/authentication.js";

const authRoutes = express.Router();

authRoutes.post("/login", login);
authRoutes.post("/register", signup);
authRoutes.post("/logout", authenticateAccessToken, logOut);
authRoutes.post("/refresh", AccessRefreshToken);
authRoutes.get("/profile", authenticateAccessToken, getMe);
authRoutes.put("/updateProfile", authenticateAccessToken, updateProfile);
authRoutes.put("/changePassword", authenticateAccessToken, changePassword);
authRoutes.post("/forgotPassword", forgotPassword);
authRoutes.post("/resetPassword", resetPassword);
authRoutes.get("/verify-email/:token", verifyEmail);
authRoutes.post("/resend-verification", authenticateAccessToken, resendVerificationEmail);
authRoutes.post("/upload-avatar", authenticateAccessToken, uploadAvatar);

export default authRoutes;
