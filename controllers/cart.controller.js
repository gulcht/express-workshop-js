const Cart = require("../models/cart.model.js");
const Product = require("../models/product.model.js");
const { successResponse, errorResponse } = require("../utils/response.js");

/**
 * Get current user's cart
 */
const getCart = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return errorResponse(res, "Unauthorized", 401);
        }

        let cart = await Cart.findOne({ user: userId }).populate({
            path: "items.product",
            select: "name price stock imageUrl description category",
        });

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        return successResponse(res, cart, "Cart fetched successfully", 200);
    } catch (error) {
        console.error("Error getting cart:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

/**
 * Add item to cart
 * req.body: { productId: string, quantity: number }
 */
const addItem = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { productId, quantity = 1 } = req.body;

        const parsedQty = parseInt(quantity, 10);
        if (!productId || isNaN(parsedQty) || parsedQty < 1) {
            return errorResponse(res, "Invalid product ID or quantity.", 400);
        }

        const product = await Product.findById(productId);
        if (!product) {
            return errorResponse(res, "Product not found", 404);
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId.toString()
        );

        const currentQtyInCart = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0;
        const totalRequestedQty = currentQtyInCart + parsedQty;

        if (product.stock < totalRequestedQty) {
            return errorResponse(
                res,
                `Insufficient stock for '${product.name}'. Available: ${product.stock}, in cart: ${currentQtyInCart}, requested: ${parsedQty}`,
                400
            );
        }

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity = totalRequestedQty;
        } else {
            cart.items.push({ product: productId, quantity: parsedQty });
        }

        await cart.save();
        await cart.populate({
            path: "items.product",
            select: "name price stock imageUrl description category",
        });

        return successResponse(res, cart, "Item added to cart successfully", 200);
    } catch (error) {
        console.error("Error adding item to cart:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

/**
 * Update item quantity in cart
 * req.params.productId, req.body: { quantity: number }
 */
const updateItemQuantity = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { productId } = req.params;
        const { quantity } = req.body;

        const parsedQty = parseInt(quantity, 10);
        if (isNaN(parsedQty) || parsedQty < 0) {
            return errorResponse(res, "Invalid quantity.", 400);
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
            return successResponse(res, cart, "Cart updated successfully", 200);
        }

        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId.toString()
        );

        if (existingItemIndex === -1) {
            return errorResponse(res, "Item not found in cart", 404);
        }

        if (parsedQty <= 0) {
            // Remove item if quantity is 0 or less
            cart.items.splice(existingItemIndex, 1);
        } else {
            // Check stock
            const product = await Product.findById(productId);
            if (!product) {
                return errorResponse(res, "Product not found", 404);
            }

            if (product.stock < parsedQty) {
                return errorResponse(
                    res,
                    `Insufficient stock for '${product.name}'. Available: ${product.stock}, requested: ${parsedQty}`,
                    400
                );
            }

            cart.items[existingItemIndex].quantity = parsedQty;
        }

        await cart.save();
        await cart.populate({
            path: "items.product",
            select: "name price stock imageUrl description category",
        });

        return successResponse(res, cart, "Cart updated successfully", 200);
    } catch (error) {
        console.error("Error updating cart item:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

/**
 * Remove item from cart
 * req.params.productId
 */
const removeItem = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { productId } = req.params;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
            return successResponse(res, cart, "Item removed from cart", 200);
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId.toString()
        );

        await cart.save();
        await cart.populate({
            path: "items.product",
            select: "name price stock imageUrl description category",
        });

        return successResponse(res, cart, "Item removed from cart successfully", 200);
    } catch (error) {
        console.error("Error removing cart item:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

module.exports = {
    getCart,
    addItem,
    updateItemQuantity,
    removeItem,
};
