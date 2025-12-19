import { Link } from 'react-router-dom';
import Layout from '@/components/Layout.jsx';
import { useCart } from '@/context/CartContext.jsx';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const [removingId, setRemovingId] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const handleRemove = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingId(null);
    }, 300);
  };

  const applyPromo = () => {
    if (promoCode.toLowerCase() === 'sweet10') {
      setDiscount(totalPrice * 0.1);
    } else {
      setDiscount(0);
    }
  };

  const deliveryFee = totalPrice > 500 ? 0 : 40;
  const finalTotal = totalPrice - discount + deliveryFee;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-md mx-auto text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-muted to-secondary rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <ShoppingBag className="w-16 h-16 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Looks like you haven't added any delicious treats yet.
              Let's fix that! 🧁
            </p>
            <Link
              to="/menu"
              className="btn-hero inline-flex items-center gap-2 group"
            >
              Browse Menu
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="gradient-hero py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 bg-secondary/80 backdrop-blur-sm text-secondary-foreground px-4 py-2 rounded-full mb-4 text-sm font-medium">
              <ShoppingBag className="w-4 h-4" />
              {items.length} {items.length === 1 ? 'item' : 'items'} in cart
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Your Cart
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`bg-card rounded-2xl p-4 md:p-6 shadow-soft transition-all duration-300 ${removingId === item.id
                  ? 'opacity-0 translate-x-10 scale-95'
                  : 'opacity-100 translate-x-0 scale-100 animate-fade-up'
                  }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl"
                    />
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                      ×{item.quantity}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {item.category}
                        </span>
                        <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mt-1">
                          {item.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 hover:rotate-12"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1 hidden md:block">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      {/* Price */}
                      <div>
                        <span className="text-sm text-muted-foreground">
                          ₹{item.price.toFixed(0)} × {item.quantity}
                        </span>
                        <p className="text-xl font-bold text-primary">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-muted rounded-full px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 rounded-full bg-card flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-bold text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-9 rounded-full bg-card flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              to="/menu"
              className="block text-center py-4 text-primary hover:underline font-medium"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card sticky top-24">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-golden" />
                Order Summary
              </h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border-2 border-transparent focus:border-primary focus:outline-none transition-colors text-sm"
                    />
                  </div>
                  <button
                    onClick={applyPromo}
                    className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Try "SWEET10" for 10% off!
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-medium">₹{totalPrice.toFixed(0)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{discount.toFixed(0)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>

                {totalPrice < 500 && (
                  <p className="text-xs text-golden bg-golden/10 px-3 py-2 rounded-lg">
                    💡 Add ₹{(500 - totalPrice).toFixed(0)} more for FREE delivery!
                  </p>
                )}

                <div className="border-t border-border my-4 pt-4" />

                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-primary">₹{finalTotal.toFixed(0)}</span>
                </div>
              </div>

              <Link to="/checkout">
                <Button className="w-full mt-6 rounded-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-golden hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">🔒 Secure</span>
                  <span className="flex items-center gap-1">🚚 Fast Delivery</span>
                  <span className="flex items-center gap-1">⭐ Quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
