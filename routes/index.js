const express = require("express");
const authRoutes = require("./auth.route.js");
const userRoutes = require("./user.route.js");
const productRoutes = require("./product.route.js");
const orderRoutes = require("./order.route.js");

const router = express.Router();

router.use("/", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);

module.exports = router;
