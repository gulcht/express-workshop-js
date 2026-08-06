const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const { generateToken } = require("../utils/generateToken.js");
const { successResponse, errorResponse } = require("../utils/response.js");

const register = async (req, res) => {
    try {
        const { username, fullName, password, email } = req.body;

        if (!username || !fullName || !password || !email) {
            return errorResponse(res, "All fields (username, fullName, password, email) are required.", 400);
        }

        if (password.length < 8) {
            return errorResponse(res, "Password must be at least 8 characters long.", 400);
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            if (existingUser.username === username) {
                return errorResponse(res, "Username already exists.", 400);
            }
            if (existingUser.email === email) {
                return errorResponse(res, "Email already exists.", 400);
            }
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            username,
            fullName,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        const userData = {
            id: newUser._id,
            username: newUser.username,
            fullName: newUser.fullName,
            email: newUser.email,
            role: newUser.role,
            isApprove: newUser.isApprove,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
        };

        return successResponse(res, userData, "User registered successfully.", 201);
    } catch (error) {
        console.error("Register Error:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

const login = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const loginIdentifier = username || email;
        if (!loginIdentifier || !password) {
            return errorResponse(res, "Username/email and password are required.", 400);
        }

        const user = await User.findOne({
            $or: [{ username: loginIdentifier }, { email: loginIdentifier }],
        });

        if (!user) {
            return errorResponse(res, "Invalid credentials.", 400);
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return errorResponse(res, "Invalid credentials.", 400);
        }

        if (!user.isApprove) {
            return errorResponse(res, "Your account is pending approval. Please contact the administrator to approve your account.", 403);
        }

        const { accessToken, refreshToken } = generateToken(user._id);

        res.cookie("accessToken", accessToken, {
            maxAge: 15 * 60 * 60 * 1000, // 15 min
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
        });

        res.cookie("refreshToken", refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
        });

        const userData = {
            id: user._id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isApprove: user.isApprove,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        return successResponse(res, userData, "Logged in successfully.", 200);
    } catch (error) {
        console.error("Login Error:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

const logout = async (req, res) => {
    try {
        res.cookie("accessToken", "", { maxAge: 0 });
        res.cookie("refreshToken", "", { maxAge: 0 });
        return successResponse(res, [], "Logged out successfully.", 200);
    } catch (error) {
        console.error("Logout Error:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return errorResponse(res, "Refresh token missing.", 401);
        }

        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!refreshSecret) {
            throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, refreshSecret);
        } catch (err) {
            return errorResponse(res, "Invalid or expired refresh token.", 401);
        }

        const userId = decoded.userId;
        const user = await User.findById(userId);
        if (!user) {
            return errorResponse(res, "User not found.", 404);
        }

        const tokens = generateToken(user._id);

        res.cookie("accessToken", tokens.accessToken, {
            maxAge: 15 * 60 * 60 * 1000, // 15 minutes
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
        });

        return successResponse(res, [], "Access token refreshed successfully.", 200);
    } catch (error) {
        console.error("Refresh Access Token Error:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshAccessToken,
};
