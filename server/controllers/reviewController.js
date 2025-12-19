import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (requires order reference)
export const createReview = async (req, res) => {
    try {
        const { productId, orderId, rating, title, comment } = req.body;

        // Validate required fields
        if (!productId || !orderId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Product ID, Order ID, and rating are required',
            });
        }

        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Check if order is delivered
        if (order.status !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'You can only review products from delivered orders',
            });
        }

        // Check if the product was in this order
        const productInOrder = order.items.some(
            item => item.product.toString() === productId
        );
        if (!productInOrder) {
            return res.status(400).json({
                success: false,
                message: 'This product was not in your order',
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ product: productId, order: orderId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product for this order',
            });
        }

        // Create the review
        const review = await Review.create({
            product: productId,
            order: orderId,
            user: req.user?._id,
            customerName: order.customerName,
            rating,
            title,
            comment,
            verified: true,
        });

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully!',
            data: review,
        });
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product for this order',
            });
        }
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const reviews = await Review.find({ product: productId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ product: productId });

        res.json({
            success: true,
            data: reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Check if a product in an order is already reviewed
// @route   GET /api/reviews/check/:orderId/:productId
// @access  Public
export const checkReviewed = async (req, res) => {
    try {
        const { orderId, productId } = req.params;

        const review = await Review.findOne({ order: orderId, product: productId });

        res.json({
            success: true,
            reviewed: !!review,
            review: review || null,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all reviews for an order (to show which products are reviewed)
// @route   GET /api/reviews/order/:orderId
// @access  Public
export const getOrderReviews = async (req, res) => {
    try {
        const { orderId } = req.params;

        const reviews = await Review.find({ order: orderId });

        // Create a map of productId -> review
        const reviewMap = {};
        reviews.forEach(review => {
            reviewMap[review.product.toString()] = review;
        });

        res.json({
            success: true,
            data: reviewMap,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        // Check ownership (if user is logged in)
        if (req.user && review.user && review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review',
            });
        }

        await Review.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Review deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
