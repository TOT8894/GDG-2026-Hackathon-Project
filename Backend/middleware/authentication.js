import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { ACCESS_TOKEN_SECRET_KEY } from "../config/env.js";

export const authenticateAccessToken = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization?.split(" ").pop();
    const access_token = req.cookies?.access_token ?? bearerToken;

    if (!access_token) {
      return res.status(400).json({ error: "Must login or SignUp" });
    }

    const decoded = jwt.verify(access_token, ACCESS_TOKEN_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};