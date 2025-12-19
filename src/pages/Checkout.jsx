import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout.jsx';
import { useCart } from '@/context/CartContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { orderApi } from '@/services/api.js';
import StripePayment from '@/components/StripePayment.jsx';
import { CreditCard, MapPin, User, Phone, Mail, Loader2, AlertCircle, Check, ShoppingBag, Truck, Shield, Lock, ArrowLeft } from 'lucide-react';

// InputWithError component defined OUTSIDE Checkout to prevent focus loss
const InputWithError = ({ icon: Icon, label, error, required = true, disabled, ...props }) => (
  <div className="group">
    <Label htmlFor={props.id} className="flex items-center gap-2 mb-2 text-sm font-medium">
      <Icon className="w-4 h-4 text-muted-foreground" />
      {label}
      {required && <span className="text-destructive">*</span>}
    </Label>
    <div className="relative">
      <Input
        {...props}
        className={`rounded-xl py-6 pl-4 pr-4 border-2 transition-all duration-300 ${error
          ? 'border-destructive bg-destructive/5'
          : 'border-muted focus:border-primary'
          }`}
        disabled={disabled}
      />
      {!error && props.value && (
        <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
      )}
    </div>
    {error && (
      <p className="text-destructive text-sm mt-1.5 flex items-center gap-1 animate-fade-in">
        <AlertCircle className="w-3.5 h-3.5" />
        {error}
      </p>
    )}
  </div>
);

// Progress Step Component
const ProgressStep = ({ step, title, isActive, isCompleted }) => (
  <div className="flex items-center gap-3">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${isCompleted
      ? 'bg-green-500 text-white'
      : isActive
        ? 'bg-primary text-primary-foreground shadow-lg scale-110'
        : 'bg-muted text-muted-foreground'
      }`}>
      {isCompleted ? <Check className="w-5 h-5" /> : step}
    </div>
    <span className={`text-sm font-medium hidden sm:block ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
      {title}
    </span>
  </div>
);

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cod'
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [pincodeInfo, setPincodeInfo] = useState(null);
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
  });

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        pincode: user.pincode || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit mobile number (starting with 6-9)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      newErrors.pincode = 'Invalid pincode. Must be 6 digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-fetch location for pincode
    if (name === 'pincode' && /^[1-9][0-9]{5}$/.test(value)) {
      fetchPincodeInfo(value);
    }
  };

  // Fetch location info from pincode
  const fetchPincodeInfo = async (pincode) => {
    setFetchingPincode(true);
    setPincodeInfo(null);

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setPincodeInfo({
          area: postOffice.Name,
          city: postOffice.District,
          state: postOffice.State,
        });
        // Auto-fill address, city, and state
        const locationStr = `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`;
        setFormData(prev => ({
          ...prev,
          address: prev.address ? prev.address : locationStr, // Only fill if empty
          city: postOffice.District,
          state: postOffice.State,
        }));
        // If address was empty, also clear any address error
        if (!formData.address) {
          setErrors(prev => ({ ...prev, address: '' }));
        }
      } else {
        setPincodeInfo({ error: 'Invalid pincode' });
      }
    } catch (error) {
      console.error('Pincode fetch error:', error);
      setPincodeInfo({ error: 'Could not verify pincode' });
    } finally {
      setFetchingPincode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    // For online payment, show the payment form
    if (paymentMethod === 'online') {
      setCurrentStep(2);
      setShowPaymentForm(true);
      return;
    }

    // For COD, place order directly
    await placeOrder(null);
  };

  const placeOrder = async (paymentData) => {
    setLoading(true);
    setCurrentStep(3);

    try {
      const total = finalTotal;

      // Prepare order data
      const orderData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerPincode: formData.pincode,
        items: items.map(item => ({
          product: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal: totalPrice,
        deliveryFee: deliveryFee,
        total: total,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        paymentId: paymentData?.paymentId || null,
      };

      const orderResponse = await orderApi.create(orderData);

      if (orderResponse.success) {
        toast({
          title: paymentMethod === 'cod'
            ? "Order Placed! 📦"
            : "Payment Successful! 🎉",
          description: paymentMethod === 'cod'
            ? `Order ${orderResponse.data.orderNumber} - Pay ₹${total} on delivery!`
            : `Order ${orderResponse.data.orderNumber} - Check your email for confirmation!`,
        });

        localStorage.setItem('customerPhone', formData.phone);
        clearCart();
        navigate('/orders');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCurrentStep(2);
      setShowPaymentForm(false);
      toast({
        title: "Order Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    await placeOrder(paymentData);
  };

  const handlePaymentError = (error) => {
    toast({
      title: "Payment Failed",
      description: error.message || "Payment could not be processed.",
      variant: "destructive",
    });
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const deliveryFee = totalPrice > 500 ? 0 : 40;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <Layout>
      {/* Header with Progress */}
      <div className="gradient-hero py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-8">
            Checkout
          </h1>

          {/* Progress Steps */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                />
              </div>

              <ProgressStep step={1} title="Cart" isActive={currentStep >= 1} isCompleted={currentStep > 1} />
              <ProgressStep step={2} title="Details" isActive={currentStep >= 2} isCompleted={currentStep > 2} />
              <ProgressStep step={3} title="Payment" isActive={currentStep >= 3} isCompleted={false} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Delivery Form */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card animate-fade-up">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                Delivery Details
              </h2>

              {isAuthenticated && (
                <div className="bg-gradient-to-r from-primary/10 to-golden/10 rounded-2xl p-4 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Logged in as <strong>{user?.name}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">Form pre-filled with your details</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <InputWithError
                    icon={User}
                    label="Full Name"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    error={errors.name}
                    disabled={loading}
                  />

                  <InputWithError
                    icon={Phone}
                    label="Phone Number"
                    id="phone"
                    name="phone"
                    type="tel"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    error={errors.phone}
                    disabled={loading}
                  />
                </div>

                <InputWithError
                  icon={Mail}
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  error={errors.email}
                  disabled={loading}
                />

                <div className="group">
                  <Label htmlFor="address" className="flex items-center gap-2 mb-2 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Delivery Address
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street, Apt 4B, City, State"
                    className={`rounded-xl min-h-[100px] border-2 transition-all duration-300 ${errors.address ? 'border-destructive bg-destructive/5' : 'border-muted focus:border-primary'
                      }`}
                    disabled={loading}
                  />
                  {errors.address && (
                    <p className="text-destructive text-sm mt-1.5 flex items-center gap-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <InputWithError
                    icon={MapPin}
                    label="Pincode (6 digits)"
                    id="pincode"
                    name="pincode"
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="110001"
                    error={errors.pincode}
                    disabled={loading}
                  />

                  {/* Pincode Location Info */}
                  {fetchingPincode && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Looking up pincode...
                    </div>
                  )}

                  {pincodeInfo && !fetchingPincode && (
                    pincodeInfo.error ? (
                      <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {pincodeInfo.error}
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                        <Check className="w-4 h-4" />
                        <span>
                          <strong>{pincodeInfo.area}</strong>, {pincodeInfo.city}, {pincodeInfo.state}
                        </span>
                      </div>
                    )
                  )}
                </div>

                {/* Payment Method Selection */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    {/* Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${paymentMethod === 'cod'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-primary text-white' : 'bg-muted'
                        }`}>
                        📦
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-foreground">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive the order</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`}>
                        {paymentMethod === 'cod' && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </button>

                    {/* Online Payment */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online')}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${paymentMethod === 'online'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'online' ? 'bg-primary text-white' : 'bg-muted'
                        }`}>
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-foreground">Pay Online</p>
                        <p className="text-sm text-muted-foreground">Card, UPI, Net Banking</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`}>
                        {paymentMethod === 'online' && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Security Badge for Online */}
                  {paymentMethod === 'online' && (
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>SSL Encrypted</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>Secure Payment</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Show Stripe Payment Form or Continue Button */}
                {showPaymentForm && paymentMethod === 'online' ? (
                  <div className="mt-6 space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentForm(false);
                        setCurrentStep(1);
                      }}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to details
                    </button>

                    <div className="bg-gradient-to-r from-primary/10 to-golden/10 rounded-xl p-4">
                      <h3 className="font-semibold text-foreground mb-1">💳 Enter Card Details</h3>
                      <p className="text-sm text-muted-foreground">Your payment is secure and encrypted</p>
                    </div>

                    <StripePayment
                      amount={finalTotal}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      customerName={formData.name}
                      customerEmail={formData.email}
                    />
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full py-7 text-lg font-semibold bg-gradient-to-r from-primary to-golden hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 mt-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {paymentMethod === 'cod' ? 'Placing Order...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        {paymentMethod === 'cod' ? (
                          <>
                            📦 Place Order - ₹{finalTotal.toFixed(0)}
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            Continue to Payment - ₹{finalTotal.toFixed(0)}
                          </>
                        )}
                      </>
                    )}
                  </Button>
                )}
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card sticky top-24 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id || item._id} className="flex gap-4 group">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">₹{item.price.toFixed(0)} each</p>
                    </div>
                    <span className="font-semibold text-foreground">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-border mt-6 pt-6 space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Delivery
                  </span>
                  <span className={deliveryFee === 0 ? 'text-green-500 font-medium' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-foreground pt-4 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">₹{finalTotal.toFixed(0)}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-500" />
                    </div>
                    <span>Money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-blue-500" />
                    </div>
                    <span>Fast delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout >
  );
};

export default Checkout;
