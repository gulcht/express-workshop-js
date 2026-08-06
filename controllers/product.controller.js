const Product = require("../models/product.model.js");
const { successResponse, errorResponse } = require("../utils/response.js");

const getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        return successResponse(res, products, "success", 200);
    } catch (error) {
        console.error("Error in getProducts:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return errorResponse(res, "Product not found", 404);
        }
        return successResponse(res, product, "success", 200);
    } catch (error) {
        console.error("Error in getProductById:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, imageUrl } = req.body;

        if (!name || price === undefined || stock === undefined) {
            return errorResponse(res, "Name, price, and stock are required fields", 400);
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
        return successResponse(res, newProduct, "Product created successfully", 201);
    } catch (error) {
        console.error("Error in createProduct:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedProduct) {
            return errorResponse(res, "Product not found", 404);
        }

        return successResponse(res, updatedProduct, "Product updated successfully", 200);
    } catch (error) {
        console.error("Error in updateProduct:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return errorResponse(res, "Product not found", 404);
        }

        return successResponse(res, [], "Product deleted successfully", 200);
    } catch (error) {
        console.error("Error in deleteProduct:", error);
        return errorResponse(res, error.message || "Internal server error", 500);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};

