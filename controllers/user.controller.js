const User = require("../models/user.model.js");
const { successResponse, errorResponse } = require("../utils/response.js");

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        return successResponse(res, users, "Get users successfully", 200);
    } catch (error) {
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

const approveUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        user.isApprove = true;
        await user.save();

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

        return successResponse(res, userData, "User approved successfully", 200);
    } catch (error) {
        console.error("Approve User Error:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

const getMe = async (req, res) => {
    try {
        return successResponse(res, req.user, "Get profile successfully", 200);
    } catch (error) {
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

module.exports = {
    getUsers,
    approveUser,
    getMe,
};


