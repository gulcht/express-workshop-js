const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const { Role } = require("../models/user.model.js");
const { errorResponse } = require("../utils/response.js");

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return errorResponse(res, "Unauthorized - No Token Provided", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return errorResponse(res, "Unauthorized - Invalid Token", 401);
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    return errorResponse(res, error.message || "Internal server error", 500);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === Role.ADMIN) {
    next();
  } else {
    return errorResponse(res, "Access denied", 403);
  }
};

module.exports = {
  protectRoute,
  adminOnly,
};

