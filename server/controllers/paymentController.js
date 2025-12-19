import Stripe from 'stripe';

// Initialize Stripe lazily to ensure env vars are loaded
let stripe = null;

const getStripe = () => {
    if (!stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not configured in .env file');
        }
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripe;
};

// @desc    Create payment intent
// @route   POST /api/payment/create-intent
// @access  Public
export const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'usd', metadata = {} } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount',
            });
        }

        // Amount should be in cents for Stripe
        const amountInCents = Math.round(amount * 100);

        const paymentIntent = await getStripe().paymentIntents.create({
            amount: amountInCents,
            currency,
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Confirm payment and get status
// @route   POST /api/payment/confirm
// @access  Public
export const confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID is required',
            });
        }

        const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

        res.json({
            success: true,
            status: paymentIntent.status,
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount / 100, // Convert from cents
        });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get Stripe publishable key
// @route   GET /api/payment/config
// @access  Public
export const getStripeConfig = async (req, res) => {
    res.json({
        success: true,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
};
