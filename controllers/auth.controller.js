const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const { generateToken } = require("../utils/generateToken.js");

const register = async (req, res) => {
    try {
        const { username, fullName, password, email } = req.body;

        if (!username || !fullName || !password || !email) {
            res.status(400).json({ message: "All fields (username, fullName, password, email) are required." });
            return;
        }

        if (password.length < 8) {
            res.status(400).json({ message: "Password must be at least 8 characters long." });
            return;
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            if (existingUser.username === username) {
                res.status(400).json({ message: "Username already exists." });
                return;
            }
            if (existingUser.email === email) {
                res.status(400).json({ message: "Email already exists." });
                return;
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

        res.status(201).json({
            message: "User registered successfully.",
            user: {
                id: newUser._id,
                username: newUser.username,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                isApprove: newUser.isApprove,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt,
            },
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const login = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const loginIdentifier = username || email;
        if (!loginIdentifier || !password) {
            res.status(400).json({ message: "Username/email and password are required." });
            return;
        }

        const user = await User.findOne({
            $or: [{ username: loginIdentifier }, { email: loginIdentifier }],
        });

        if (!user) {
            res.status(400).json({ message: "Invalid credentials." });
            return;
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(400).json({ message: "Invalid credentials." });
            return;
        }

        if (!user.isApprove) {
            res.status(403).json({ message: "Your account is pending approval. Please contact the administrator to approve your account." });
            return;
        }

        const { accessToken, refreshToken } = generateToken(user._id);

        res.cookie("accessToken", accessToken, {
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
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

        res.status(200).json({
            message: "Logged in successfully.",
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                isApprove: user.isApprove,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const logout = async (req, res) => {
    try {
        res.cookie("accessToken", "", { maxAge: 0 });
        res.cookie("refreshToken", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            res.status(401).json({ message: "Refresh token missing." });
            return;
        }

        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!refreshSecret) {
            throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, refreshSecret);
        } catch (err) {
            res.status(401).json({ message: "Invalid or expired refresh token." });
            return;
        }

        const userId = decoded.userId;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
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

        res.status(200).json({
            message: "Access token refreshed successfully.",
        });
    } catch (error) {
        console.error("Refresh Access Token Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshAccessToken,
};
