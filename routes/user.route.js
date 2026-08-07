const express = require("express");
const { getUsers, approveUser } = require("../controllers/user.controller.js");
const { protectRoute, adminOnly } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.use(protectRoute);
router.get("/", adminOnly, getUsers);
router.patch("/:id/approve", adminOnly, approveUser);

module.exports = router;
