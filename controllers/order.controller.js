const Order = require("../models/order.model.js");
const Product = require("../models/product.model.js");
const Cart = require("../models/cart.model.js");
const { Role } = require("../models/user.model.js");
const { successResponse, errorResponse } = require("../utils/response.js");

const createOrder = async (req, res) => {
    try {
        const userId = req.user?._id;
        let { items } = req.body || {}; // items: [{ product: string, quantity: number }]

        let isCartCheckout = false;
        // If items are not provided or empty array, attempt to checkout user's cart
        if (!items || !Array.isArray(items) || items.length === 0) {
            const userCart = await Cart.findOne({ user: userId });
            if (!userCart || !userCart.items || userCart.items.length === 0) {
                return errorResponse(res, "Cart is empty. Order must contain at least one item.", 400);
            }
            items = userCart.items.map((item) => ({
                product: item.product.toString(),
                quantity: item.quantity,
            }));
            isCartCheckout = true;
        }

        let totalAmount = 0;
        const orderItems = [];

        // Validate stock and prepare order items
        for (const item of items) {
            const { product: productId, quantity } = item;

            if (!productId || !quantity || quantity < 1) {
                return errorResponse(res, "Invalid product ID or quantity.", 400);
            }

            const product = await Product.findById(productId);
            if (!product) {
                return errorResponse(res, `Product not found: ${productId}`, 404);
            }

            if (product.stock < quantity) {
                return errorResponse(
                    res,
                    `Insufficient stock for product '${product.name}'. Available: ${product.stock}, requested: ${quantity}`,
                    400
                );
            }

            const itemPrice = product.price;
            totalAmount += itemPrice * quantity;

            orderItems.push({
                product: product._id,
                quantity,
                price: itemPrice,
            });
        }

        // Update stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity },
            });
        }

        const newOrder = new Order({
            user: userId,
            items: orderItems,
            totalAmount,
        });

        await newOrder.save();
        await newOrder.populate("items.product", "name price");

        // If order was created from cart, clear cart items
        if (isCartCheckout) {
            await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
        }

        return successResponse(res, newOrder, "Order placed successfully", 201);
    } catch (error) {
        console.error("Error creating order:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

const getOrders = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return errorResponse(res, "Unauthorized", 401);
        }

        let orders;
        if (user.role === Role.ADMIN) {
            orders = await Order.find()
                .populate("user", "username email fullName")
                .populate("items.product", "name price")
                .sort({ createdAt: -1 });
        } else {
            orders = await Order.find({ user: user._id })
                .populate("items.product", "name price")
                .sort({ createdAt: -1 });
        }

        return successResponse(res, orders, "Get orders successfully", 200);
    } catch (error) {
        console.error("Error getting orders:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!user) {
            return errorResponse(res, "Unauthorized", 401);
        }

        const order = await Order.findById(id)
            .populate("user", "username email fullName")
            .populate("items.product", "name price");

        if (!order) {
            return errorResponse(res, "Order not found", 404);
        }

        if (user.role !== Role.ADMIN && order.user._id.toString() !== user._id.toString()) {
            return errorResponse(res, "Access denied - You can only view your own orders", 403);
        }

        return successResponse(res, order, "Get order successfully", 200);
    } catch (error) {
        console.error("Error getting order by ID:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

        if (!status || !validStatuses.includes(status)) {
            return errorResponse(
                res,
                `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
                400
            );
        }

        const order = await Order.findById(id);

        if (!order) {
            return errorResponse(res, "Order not found", 404);
        }

        order.status = status;
        await order.save();
        await order.populate("user", "username email fullName");
        await order.populate("items.product", "name price");

        return successResponse(res, order, "Order status updated successfully", 200);
    } catch (error) {
        console.error("Error updating order status:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

// params = productId
const getOrdersByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = req.user;

        if (!user) {
            return errorResponse(res, "Unauthorized", 401);
        }

        let query = { "items.product": productId };

        if (user.role !== Role.ADMIN) {
            query.user = user._id;
        }

        const orders = await Order.find(query)
            .populate("user", "username email fullName")
            .populate("items.product", "name price")
            .sort({ createdAt: -1 });

        return successResponse(res, orders, "Get orders by product ID successfully", 200);
    } catch (error) {
        console.error("Error getting orders by product ID:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

// params = productId
const createOrderByProductId = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { id: productId } = req.params;
        const quantity = req.body?.quantity ? parseInt(req.body.quantity, 10) : 1;

        if (!productId || isNaN(quantity) || quantity < 1) {
            return errorResponse(res, "Invalid product ID or quantity.", 400);
        }

        const product = await Product.findById(productId);
        if (!product) {
            return errorResponse(res, `Product not found: ${productId}`, 404);
        }

        if (product.stock < quantity) {
            return errorResponse(
                res,
                `Insufficient stock for product '${product.name}'. Available: ${product.stock}, requested: ${quantity}`,
                400
            );
        }

        const itemPrice = product.price;
        const totalAmount = itemPrice * quantity;

        const orderItems = [
            {
                product: product._id,
                quantity,
                price: itemPrice,
            },
        ];

        // Update stock
        await Product.findByIdAndUpdate(productId, {
            $inc: { stock: -quantity },
        });

        const newOrder = new Order({
            user: userId,
            items: orderItems,
            totalAmount,
        });

        await newOrder.save();
        await newOrder.populate("items.product", "name price");

        return successResponse(res, newOrder, "Order placed successfully", 201);
    } catch (error) {
        console.error("Error creating order by product ID:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    getOrdersByProductId,
    createOrderByProductId,
    updateOrderStatus,
};



