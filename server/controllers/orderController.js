import Order from '../models/Order.js';
import { sendEmail, emailTemplates } from '../utils/email.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            customerPincode,
            items,
            subtotal,
            deliveryFee = 5.00,
            total,
            paymentId,
            paymentStatus = 'paid',
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No order items provided',
            });
        }

        // Validate pincode (6 digits for India)
        if (!customerPincode || !/^[1-9][0-9]{5}$/.test(customerPincode)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pincode. Must be 6 digits.',
            });
        }

        // Validate email
        if (!customerEmail || !/^\S+@\S+\.\S+$/.test(customerEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Valid email is required',
            });
        }

        const order = await Order.create({
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            customerPincode,
            items,
            subtotal,
            deliveryFee,
            total,
            paymentId,
            paymentStatus,
            status: 'confirmed',
            user: req.user?._id, // Optional: if user is logged in
        });

        // Send order confirmation email
        try {
            const confirmEmail = emailTemplates.orderConfirmation(order);
            await sendEmail({
                to: customerEmail,
                ...confirmEmail
            });
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
            // Don't fail the order if email fails
        }

        res.status(201).json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('items.product', 'name image');

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get user's orders (guest lookup by phone)
// @route   GET /api/orders
// @access  Public (by phone) or Private (by user)
export const getUserOrders = async (req, res) => {
    try {
        const { phone } = req.query;

        let query = {};

        // If user is logged in, get their orders
        if (req.user) {
            query.user = req.user._id;
        } else if (phone) {
            // Guest can look up by phone number
            query.customerPhone = phone;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Please provide phone number or login to view orders',
            });
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .populate('items.product', 'name image');

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/all
// @access  Admin
export const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        let query = {};
        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('user', 'name email');

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            count: orders.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Public/Private
export const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'name image')
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get order stats (admin dashboard)
// @route   GET /api/orders/stats
// @access  Admin
export const getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const paidOrders = await Order.countDocuments({ paymentStatus: 'paid' });
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]);

        const totalRevenue = revenueResult[0]?.total || 0;

        // Recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                totalOrders,
                paidOrders,
                pendingOrders,
                deliveredOrders,
                totalRevenue,
                recentOrders,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
