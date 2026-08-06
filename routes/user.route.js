const express = require("express");
const { getUsers, approveUser } = require("../controllers/user.controller.js");
const { protectRoute, adminOnly } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.get("/", protectRoute, getUsers);
router.patch("/:id/approve", protectRoute, adminOnly, approveUser);

module.exports = router;
