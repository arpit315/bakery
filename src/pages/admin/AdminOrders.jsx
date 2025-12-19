import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout.jsx';
import { orderApi } from '@/services/api.js';
import { Eye, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAll();
      setOrders(response.data || []);

      // Calculate stats
      const total = response.data?.length || 0;
      const paid = response.data?.filter(o => o.paymentStatus === 'paid').length || 0;
      const pending = response.data?.filter(o => o.status === 'pending' || o.status === 'confirmed').length || 0;
      setStats({ total, paid, pending });
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast({
        title: "Error",
        description: "Failed to load orders. Is the server running?",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderApi.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-700';
      case 'preparing':
        return 'bg-amber-100 text-amber-700';
      case 'confirmed':
        return 'bg-purple-100 text-purple-700';
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
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Orders
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage customer orders
          </p>
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Items</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr
                      key={order._id}
                      className="border-t border-border hover:bg-muted/30 transition-colors animate-fade-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="py-4 px-6 font-medium text-foreground">{order.orderNumber}</td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-foreground">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm max-w-[200px] truncate">
                        {order.items?.map(item => `${item.name} x${item.quantity}`).join(', ')}
                      </td>
                      <td className="py-4 px-6 font-semibold text-foreground">
                        ₹{order.total?.toFixed(0)}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order._id, value)}
                        >
                          <SelectTrigger className={`w-[140px] rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            <SelectValue>{formatStatus(order.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
            <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <h3 className="text-sm font-medium text-muted-foreground">Paid Orders</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.paid}</p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <h3 className="text-sm font-medium text-muted-foreground">Pending Orders</h3>
            <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
