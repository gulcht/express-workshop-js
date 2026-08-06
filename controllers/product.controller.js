const Product = require("../models/product.model.js");

const getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        console.error("Error in getProducts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Error in getProductById:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, imageUrl } = req.body;

        if (!name || price === undefined || stock === undefined) {
            res.status(400).json({ message: "Name, price, and stock are required fields" });
            return;
        }

        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            category,
            imageUrl,
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error in createProduct:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// PUT /api/products/:id - Update product by ID (Admin only)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedProduct) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error in updateProduct:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// DELETE /api/products/:id - Delete product by ID (Admin only)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error in deleteProduct:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
