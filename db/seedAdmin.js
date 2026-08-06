const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const { Role } = require("../models/user.model");

const seedAdmin = async () => {
    try {
        const adminUsername = process.env.ADMIN_USERNAME || "admin";
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";
        const adminFullName = process.env.ADMIN_FULL_NAME || "System Administrator";

        const existingAdmin = await User.findOne({ role: Role.ADMIN });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const newAdmin = new User({
                username: adminUsername,
                email: adminEmail,
                fullName: adminFullName,
                password: hashedPassword,
                role: Role.ADMIN,
                isApprove: true,
            });

            await newAdmin.save();
            console.log(`Default admin account created successfully (${adminUsername} / ${adminEmail}).`);
        }
    } catch (error) {
        console.error("Error seeding initial admin user:", error.message);
    }
};

module.exports = seedAdmin;
