const express = require("express");
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/product.controller.js");
const { protectRoute, adminOnly } = require("../middleware/auth.middleware.js");
const { getOrdersByProductId, createOrderByProductId } = require("../controllers/order.controller.js");
const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected routes
router.post("/:id/orders", protectRoute, createOrderByProductId);
router.get("/:productId/orders", protectRoute, getOrdersByProductId);

// Protected Admin-only routes
router.post("/", protectRoute, adminOnly, createProduct);
router.put("/:id", protectRoute, adminOnly, updateProduct);
router.delete("/:id", protectRoute, adminOnly, deleteProduct);

module.exports = router;

