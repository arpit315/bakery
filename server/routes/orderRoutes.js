import express from 'express';
import {
    createOrder,
    getUserOrders,
    getMyOrders,
    getAllOrders,
    getOrder,
    updateOrderStatus,
    getOrderStats,
} from '../controllers/orderController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public/User routes
router.post('/', optionalAuth, createOrder);
router.get('/', optionalAuth, getUserOrders);

// Protected user routes
router.get('/my-orders', protect, getMyOrders);

// Admin routes
router.get('/stats', protect, adminOnly, getOrderStats);
router.get('/all', protect, adminOnly, getAllOrders);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

// Public route for tracking
router.get('/:id', getOrder);

export default router;
