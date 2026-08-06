const Order = require("../models/order.model.js");
const Product = require("../models/product.model.js");
const { Role } = require("../models/user.model.js");

const createOrder = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { items } = req.body; // items: [{ product: string, quantity: number }]

        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ message: "Order must contain at least one item." });
            return;
        }

        let totalAmount = 0;
        const orderItems = [];

        // Validate stock and prepare order items
        for (const item of items) {
            const { product: productId, quantity } = item;

            if (!productId || !quantity || quantity < 1) {
                res.status(400).json({ message: "Invalid product ID or quantity." });
                return;
            }

            const product = await Product.findById(productId);
            if (!product) {
                res.status(404).json({ message: `Product not found: ${productId}` });
                return;
            }

            if (product.stock < quantity) {
                res.status(400).json({
                    message: `Insufficient stock for product '${product.name}'. Available: ${product.stock}, requested: ${quantity}`,
                });
                return;
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

        res.status(201).json({
            message: "Order placed successfully",
            order: newOrder,
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getOrders = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
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

        res.status(200).json({ orders });
    } catch (error) {
        console.error("Error getting orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const order = await Order.findById(id)
            .populate("user", "username email fullName")
            .populate("items.product", "name price");

        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }

        if (user.role !== Role.ADMIN && order.user._id.toString() !== user._id.toString()) {
            res.status(403).json({ message: "Access denied - You can only view your own orders" });
            return;
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error("Error getting order by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

        if (!status || !validStatuses.includes(status)) {
            res.status(400).json({
                message: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
            });
            return;
        }

        const order = await Order.findById(id);

        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }

        order.status = status;
        await order.save();
        await order.populate("user", "username email fullName");
        await order.populate("items.product", "name price");

        res.status(200).json({
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getOrderByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = req.user;

        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        let query = { "items.product": productId };

        if (user.role !== Role.ADMIN) {
            query.user = user._id;
        }

        const orders = await Order.find(query)
            .populate("user", "username email fullName")
            .populate("items.product", "name price")
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (error) {
        console.error("Error getting orders by product ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    getOrderByProductId,
    updateOrderStatus,
};

