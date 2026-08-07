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

router.use(protectRoute);

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/:id/orders", createOrderByProductId);
router.get("/:productId/orders", getOrdersByProductId);

// Protected Admin-only routes
router.post("/", adminOnly, createProduct);
router.put("/:id", adminOnly, updateProduct);
router.delete("/:id", adminOnly, deleteProduct);

module.exports = router;
