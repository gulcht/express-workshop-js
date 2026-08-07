const express = require("express");
const { getUsers, approveUser, getMe } = require("../controllers/user.controller.js");
const { protectRoute, adminOnly } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.use(protectRoute);

router.get("/me", getMe);
router.get("/", adminOnly, getUsers);
router.patch("/:id/approve", adminOnly, approveUser);

module.exports = router;
