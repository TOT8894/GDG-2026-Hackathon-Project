import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import RefreshToken from "../models/refreshToken.js";
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

const sanitizeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
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

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await storeRefreshToken(user._id, refreshToken);

    return res.status(201).json({
      message: "User registered successfully",
      data: sanitizeUser(user),
      accessToken,
      refreshToken,
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
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
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
