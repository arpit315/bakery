import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { orderApi, reviewApi } from '@/services/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Clock, CheckCircle, Loader2, Search, LogIn, Star, MessageSquare } from 'lucide-react';
import ReviewForm from '@/components/ReviewForm.jsx';

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [showPhoneSearch, setShowPhoneSearch] = useState(false);

  // Review state
  const [reviewModal, setReviewModal] = useState({ open: false, product: null, order: null });
  const [orderReviews, setOrderReviews] = useState({}); // { orderId: { productId: review } }

  const fetchOrders = async () => {
    try {
      setLoading(true);

      if (isAuthenticated) {
        const response = await orderApi.getMyOrders();
        setOrders(response.data || []);
      } else {
        const phone = localStorage.getItem('customerPhone');

        if (phone) {
          const response = await orderApi.getUserOrders(phone);
          setOrders(response.data || []);
        } else {
          setOrders([]);
          setShowPhoneSearch(true);
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews for delivered orders
  const fetchOrderReviews = async (orderId) => {
    try {
      const response = await reviewApi.getOrderReviews(orderId);
      setOrderReviews(prev => ({
        ...prev,
        [orderId]: response.data || {},
      }));
    } catch (err) {
      console.error('Error fetching order reviews:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  // Fetch reviews for delivered orders
  useEffect(() => {
    orders.forEach(order => {
      if (order.status === 'delivered') {
        fetchOrderReviews(order._id);
      }
    });
  }, [orders]);

  const handlePhoneSearch = async (e) => {
    e.preventDefault();

    if (!searchPhone || searchPhone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      const response = await orderApi.getUserOrders(searchPhone);
      setOrders(response.data || []);
      localStorage.setItem('customerPhone', searchPhone);
      setShowPhoneSearch(false);
      setError(null);
    } catch (err) {
      setError(err.message || 'No orders found for this phone number');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (product, order) => {
    setReviewModal({
      open: true,
      product,
      order,
    });
  };

  const handleReviewSubmitted = () => {
    // Refresh reviews for this order
    if (reviewModal.order) {
      fetchOrderReviews(reviewModal.order._id);
    }
  };

  const isProductReviewed = (orderId, productId) => {
    return orderReviews[orderId] && orderReviews[orderId][productId];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'preparing':
      case 'out_for_delivery':
      case 'confirmed':
        return <Clock className="w-5 h-5 text-golden" />;
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'preparing':
      case 'out_for_delivery':
        return 'bg-amber-100 text-amber-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Layout>
      <div className="gradient-hero py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground text-center">
            My Orders
          </h1>
          <p className="text-muted-foreground text-center mt-3">
            {isAuthenticated
              ? `Welcome back, ${user?.name}! Here are your orders.`
              : 'Track your order history and status'
            }
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Guest login prompt */}
        {!isAuthenticated && (
          <div className="max-w-xl mx-auto mb-8">
            <div className="bg-primary/5 rounded-2xl p-6 text-center">
              <LogIn className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-foreground mb-4">
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>{' '}
                to automatically see all your orders, or search by phone number below.
              </p>
            </div>
          </div>
        )}

        {/* Phone Search (for guests) */}
        {!isAuthenticated && showPhoneSearch && (
          <div className="max-w-md mx-auto mb-8">
            <form onSubmit={handlePhoneSearch} className="bg-card rounded-2xl p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find Your Orders
              </h3>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="rounded-xl"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error && orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            {!isAuthenticated && (
              <Button variant="outline" onClick={() => setShowPhoneSearch(true)}>
                Try Another Phone Number
              </Button>
            )}
          </div>
        ) : orders.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              No Orders Yet
            </h2>
            <p className="text-muted-foreground mb-8">
              Start ordering to see your order history here.
            </p>
            <Link to="/menu" className="btn-hero inline-block">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Show search again button for guests */}
            {!isAuthenticated && (
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPhoneSearch(true)}
                  className="rounded-full"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Different Number
                </Button>
              </div>
            )}

            {orders.map((order, index) => (
              <div
                key={order._id}
                className="bg-card rounded-2xl p-6 shadow-soft animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{order.orderNumber}</h3>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:flex-col md:items-end">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                    <span className="font-bold text-primary text-lg">
                      ₹{order.total.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Order Items with Review Buttons */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-3">Items</p>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.product || item._id}
                        className="flex items-center justify-between gap-3 bg-muted/50 rounded-xl p-3"
                      >
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ₹{item.price} × {item.quantity}
                            </p>
                          </div>
                        </div>

                        {/* Review Button (only for delivered orders) */}
                        {order.status === 'delivered' && (
                          <div>
                            {isProductReviewed(order._id, item.product) ? (
                              <span className="flex items-center gap-1 text-sm text-green-600 bg-green-100 px-3 py-1.5 rounded-full">
                                <CheckCircle className="w-4 h-4" />
                                Reviewed
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openReviewModal(item, order)}
                                className="rounded-full hover:bg-primary hover:text-white transition-colors"
                              >
                                <Star className="w-4 h-4 mr-1" />
                                Review
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Delivery:</span>{' '}
                    {order.customerAddress}
                    {order.customerPincode && ` - ${order.customerPincode}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewForm
        isOpen={reviewModal.open}
        onClose={() => setReviewModal({ open: false, product: null, order: null })}
        productId={reviewModal.product?.product?.toString() || reviewModal.product?._id}
        productName={reviewModal.product?.name}
        orderId={reviewModal.order?._id}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </Layout>
  );
};

export default Orders;
