import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { paymentApi } from '@/services/api.js';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, CreditCard } from 'lucide-react';

// Initialize Stripe - use environment variable or fallback
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SfmZlGo9IOUz9EGaDV99I9IFp4lntVXsZg7oylb2lHYhvEG2meqvvCYoEOIgiKEhbgyZWQ7zMjpKzHuAMJFIv1T00bA2s9UDT');

// Card element styling
const cardElementOptions = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        invalid: {
            color: '#e53e3e',
            iconColor: '#e53e3e',
        },
    },
    hidePostalCode: true,
};

// Payment Form Component (inside Elements provider)
const CheckoutForm = ({ amount, onSuccess, onError, customerName, customerEmail }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Create payment intent on backend
            const { clientSecret, paymentIntentId } = await paymentApi.createIntent(amount);

            if (!clientSecret) {
                throw new Error('Failed to create payment');
            }

            // Confirm payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: customerName,
                            email: customerEmail,
                        },
                    },
                }
            );

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            if (paymentIntent.status === 'succeeded') {
                onSuccess({
                    paymentId: paymentIntent.id,
                    status: paymentIntent.status,
                });
            } else {
                throw new Error('Payment was not successful');
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message);
            onError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 border-2 border-muted rounded-xl bg-white">
                <CardElement options={cardElementOptions} />
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                    <span>❌</span>
                    {error}
                </div>
            )}

            <Button
                type="submit"
                disabled={!stripe || loading}
                className="w-full rounded-full py-7 text-lg font-semibold bg-gradient-to-r from-primary to-golden hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    <>
                        <Lock className="w-5 h-5" />
                        Pay ₹{amount.toFixed(0)}
                    </>
                )}
            </Button>

            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    <span>Powered by Stripe</span>
                </div>
            </div>
        </form>
    );
};

// Main Stripe Payment Component
const StripePayment = ({ amount, onSuccess, onError, customerName, customerEmail }) => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm
                amount={amount}
                onSuccess={onSuccess}
                onError={onError}
                customerName={customerName}
                customerEmail={customerEmail}
            />
        </Elements>
    );
};

export default StripePayment;
