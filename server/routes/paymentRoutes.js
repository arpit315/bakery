import express from 'express';
import {
    createPaymentIntent,
    confirmPayment,
    getStripeConfig,
} from '../controllers/paymentController.js';

const router = express.Router();

// Get Stripe publishable key
router.get('/config', getStripeConfig);

// Create payment intent
router.post('/create-intent', createPaymentIntent);

// Confirm payment
router.post('/confirm', confirmPayment);

export default router;
