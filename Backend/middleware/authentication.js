import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { ACCESS_TOKEN_SECRET_KEY } from "../config/env.js";

export const authenticateAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "invalid token format" });
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({ error: "access token not found" });
    }

    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET_KEY);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({ error: "invalid or expired token" });
  };
};

export default authenticateAccessToken;
