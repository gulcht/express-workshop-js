const express = require("express");
const {
    login,
    logout,
    refreshAccessToken,
    register,
} = require("../controllers/auth.controller.js");

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshAccessToken);
router.post("/register", register);

module.exports = router;
