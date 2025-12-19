import express from 'express';
import {
    createReview,
    getProductReviews,
    checkReviewed,
    getOrderReviews,
    deleteReview,
} from '../controllers/reviewController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Create a review (optionally authenticated)
router.post('/', optionalAuth, createReview);

// Get reviews for a product
router.get('/product/:productId', getProductReviews);

// Check if a product in an order is reviewed
router.get('/check/:orderId/:productId', checkReviewed);

// Get all reviews for an order
router.get('/order/:orderId', getOrderReviews);

// Delete a review
router.delete('/:id', optionalAuth, deleteReview);

export default router;
