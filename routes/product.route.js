const express = require("express");
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/product.controller.js");
const { protectRoute, adminOnly } = require("../middleware/auth.middleware.js");
const { getOrdersByProductId } = require("../controllers/order.controller.js");
const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/:productId/orders", getOrdersByProductId);

// Protected Admin-only routes
router.post("/", protectRoute, adminOnly, createProduct);
router.put("/:id", protectRoute, adminOnly, updateProduct);
router.delete("/:id", protectRoute, adminOnly, deleteProduct);

module.exports = router;
