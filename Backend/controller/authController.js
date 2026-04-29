import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import RefreshToken from "../models/refreshToken.js";
import { sendPasswordResetEmail, sendEmailVerification } from "../utils/emailService.js";
import {
  userUpdateValidationSchema,
  userValidationSchema,
} from "../validation/userValidation.js";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET_KEY,
} from "../config/env.js";
import multer from "multer";
import path from "path";

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

const sanitizeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  isEmailVerified: user.isEmailVerified,
  isActive: user.isActive,
  avatar: user.avatar,
  phone: user.phone,
  location: user.location,
  trustScore: user.trustScore,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

const createRefreshToken = (user) =>
  jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

const storeRefreshToken = async (userId, refreshToken) => {
  const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);

  await RefreshToken.findOneAndUpdate(
    { userId },
    { token: hashedRefreshToken, expiresAt },
    { upsert: true, returnDocument: "after" }
  );
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await storeRefreshToken(user._id, refreshToken);

    return res.status(200).json({
      message: "Login successful",
      data: sanitizeUser(user),
      accessToken,
      refreshToken,
    });
    console.log(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, role, phone, avatar, location } = req.body;

    const { error } = userValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      phone: phone || "",
      avatar: avatar || "",
      location: location || undefined,
    });

    // Send email verification
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
    user.emailVerificationToken = hashedVerificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 86400000); // 24 hours
    await user.save();

    sendEmailVerification(user.email, verificationToken)
      .catch((emailError) => {
        console.error("Failed to send verification email:", emailError);
      });

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await storeRefreshToken(user._id, refreshToken);

    // Return verification token in development mode for testing
    const devVerificationUrl = process.env.NODE_ENV === "development"
      ? `${process.env.CLIENT_URL}/verify-email/${verificationToken}`
      : undefined;

    return res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
      data: sanitizeUser(user),
      accessToken,
      refreshToken,
      // For testing in development - include email and token for easy verification
      ...(process.env.NODE_ENV === "development" && {
        verificationToken,
        verificationUrl: devVerificationUrl,
        email: user.email
      }),
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const AccessRefreshToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const refreshToken =
      req.body?.refreshToken ||
      (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

    if (!refreshToken) {
      return res.status(401).json({ error: "refresh token not found" });
    }

    const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const refreshTokenDoc = await RefreshToken.findOne({
      token: hashedRefreshToken,
      expiresAt: { $gt: new Date() },
    });

    if (!refreshTokenDoc) {
      return res.status(401).json({ error: "invalid refresh token" });
    }

    const user = await User.findById(refreshTokenDoc.userId);
    if (!user) {
      return res.status(401).json({ error: "user not found" });
    }

    const accessToken = createAccessToken(user);
    return res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const logOut = async (req, res) => {
  try {
    await RefreshToken.deleteOne({ userId: req.user._id });
    return res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { error } = userUpdateValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (req.body.email) {
      const existingUser = await User.findOne({
        email: req.body.email,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(400).json({ error: "email already in use" });
      }
    }

    const updates = { ...req.body };
    // Don't allow password update through this endpoint
    delete updates.password;

    // Role validation: only admins can become admin or promote others to admin
    if (updates.role && updates.role === "admin" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can assign admin role" });
    }

    // Non-admins can only switch between buyer and seller
    if (updates.role && req.user.role !== "admin" && !["buyer", "seller"].includes(updates.role)) {
      return res.status(403).json({ error: "You can only switch between buyer and seller roles" });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      returnDocument: "after",
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "new password must be at least 8 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Invalidate all refresh tokens for security
    await RefreshToken.deleteMany({ userId: user._id });

    return res.status(200).json({
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const user = await User.findOne({ email });

    // Don't reveal if user exists for security
    if (!user) {
      return res.status(200).json({
        message: "If an account exists with this email, a password reset link has been sent",
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send email with reset link
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Don't fail the request if email fails
    }

    return res.status(200).json({
      message: "If an account exists with this email, a password reset link has been sent",
      // Remove this in production:
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
      email: user.email
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "password must be at least 8 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Invalidate all refresh tokens
    await RefreshToken.deleteMany({ userId: user._id });

    return res.status(200).json({
      message: "Password reset successfully. Please login with your new password.",
      email: user.email
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    // Hash the token to compare with stored value
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by both email verification token and check if not expired
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired verification token",
        debug: {
          providedToken: token,
          providedHash: hashedToken
        }
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully. You can now make payments.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const uploadAvatar = [
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Convert to base64 for storage
      const avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        message: "Avatar uploaded successfully",
        url: avatar,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
];

export const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
    user.emailVerificationToken = hashedVerificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 86400000); // 24 hours
    await user.save();

    try {
      await sendEmailVerification(user.email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return res.status(500).json({ error: "Failed to send verification email" });
    }

    return res.status(200).json({
      message: "Verification email sent. Please check your inbox.",
      email: user.email
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
