const express = require("express");
const { protectRoute } = require("../middleware/auth.middleware.js");
const {
    getCart,
    addItem,
    updateItemQuantity,
    removeItem,
} = require("../controllers/cart.controller.js");

const router = express.Router();

router.use(protectRoute);

router.get("/", getCart);
router.post("/items", addItem);
router.patch("/items/:productId", updateItemQuantity);
router.delete("/items/:productId", removeItem);

module.exports = router;
