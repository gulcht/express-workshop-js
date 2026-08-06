const User = require("../models/user.model.js");

const getUsers = async (req, res) => {
    try {
        res.status(200).json({ message: "Get users endpoint" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const approveUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        user.aprove = true;
        await user.save();

        res.status(200).json({
            message: "User approved successfully",
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                aprove: user.aprove,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        console.error("Approve User Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getUsers,
    approveUser,
};
