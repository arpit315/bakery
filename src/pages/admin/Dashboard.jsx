import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout.jsx';
import { orderApi, productApi } from '@/services/api.js';
import { DollarSign, ShoppingCart, Package, TrendingUp, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch order stats
        const statsResponse = await orderApi.getStats();
        setStats(statsResponse.data);

        // Fetch products count
        const productsResponse = await productApi.getAll();
        setProducts(productsResponse.data || []);

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: stats ? `₹${stats.totalRevenue?.toFixed(0) || '0'}` : '₹0',
      change: '+12.5%',
      positive: true,
    },
    {
      icon: ShoppingCart,
      label: 'Total Orders',
      value: stats?.totalOrders?.toString() || '0',
      change: '+8.2%',
      positive: true,
    },
    {
      icon: Package,
      label: 'Products',
      value: products.length.toString(),
      change: `${products.length} items`,
      positive: true,
    },
    {
      icon: TrendingUp,
      label: 'Pending Orders',
      value: stats?.pendingOrders?.toString() || '0',
      change: 'Need attention',
      positive: stats?.pendingOrders === 0,
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening with your bakery.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-xl p-4">
            {error} - Make sure the backend server is running.
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 shadow-soft animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <span className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-amber-600'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-2xl p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6">
            Recent Orders
          </h2>
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4 font-medium text-foreground">{order.orderNumber}</td>
                      <td className="py-4 px-4 text-foreground">{order.customerName}</td>
                      <td className="py-4 px-4 text-muted-foreground text-sm">
                        {order.items?.map(i => i.name).join(', ')}
                      </td>
                      <td className="py-4 px-4 font-semibold text-foreground">₹{order.total?.toFixed(0)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                          }`}>
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No orders yet</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
