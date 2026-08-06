const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
        throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
    }

    const accessToken = jwt.sign({ userId }, secret, {
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId }, refreshSecret, {
        expiresIn: "7d",
    });

    return { accessToken, refreshToken };
};

module.exports = { generateToken };
