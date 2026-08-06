const express = require("express");
const { protectRoute, adminOnly } = require("../middleware/auth.middleware.js");
const {
    createOrder,
    getOrders,
    getOrderById,
    getOrderByProductId,
    updateOrderStatus,
} = require("../controllers/order.controller.js");

const router = express.Router();

router.use(protectRoute);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/product/:productId", getOrderByProductId);
router.get("/:id", getOrderById);
router.patch("/:id/status", adminOnly, updateOrderStatus);

module.exports = router;
