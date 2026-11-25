import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Package,
  MapPin,
  User,
  Calendar,
  CreditCard,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { Order, OrderItem } from '../../types/database';

type OrderStatus = Order['status'];
type PaymentStatus = Order['payment_status'];

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

const STATUS_TABS: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const ORDER_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded',
];

const orderStatusColor: Record<OrderStatus, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-indigo-100 text-indigo-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
  refunded:   'bg-orange-100 text-orange-800',
};

const paymentStatusColor: Record<PaymentStatus, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  paid:     'bg-green-100 text-green-700',
  failed:   'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
};

const PAGE_SIZE = 10;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

interface OrderDetailModalProps {
  order: OrderWithItems;
  onClose: () => void;
  onStatusUpdated: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onStatusUpdated }) => {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.notes ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('orders')
      .update({ status, notes: notes || null, updated_at: new Date().toISOString() })
      .eq('id', order.id);
    setSaving(false);
    if (error) {
      toast.error('Failed to update order: ' + error.message);
    } else {
      toast.success('Order updated successfully');
      onStatusUpdated();
      onClose();
    }
  };

  const addr = order.shipping_address as Record<string, string> | null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500 font-mono">{order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1"><Calendar size={14} /><span className="text-xs font-medium">Date</span></div>
              <p className="text-sm font-semibold text-gray-800">{formatDate(order.created_at)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1"><CreditCard size={14} /><span className="text-xs font-medium">Payment</span></div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${paymentStatusColor[order.payment_status]}`}>
                {order.payment_status}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1"><Package size={14} /><span className="text-xs font-medium">Items</span></div>
              <p className="text-sm font-semibold text-gray-800">{order.order_items.length} item(s)</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1"><FileText size={14} /><span className="text-xs font-medium">Total</span></div>
              <p className="text-sm font-semibold text-henna-700">{formatCurrency(order.total_amount)}</p>
            </div>
          </div>

          {/* Customer */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><User size={14} /> Customer</h3>
            <p className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-lg">{order.user_id}</p>
          </div>

          {/* Shipping Address */}
          {addr && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><MapPin size={14} /> Shipping Address</h3>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
                {addr.full_name && <p className="font-semibold">{addr.full_name}</p>}
                {addr.phone && <p>{addr.phone}</p>}
                {addr.line1 && <p>{addr.line1}</p>}
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{[addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ')}</p>
                {addr.country && <p>{addr.country}</p>}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Items</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Pack</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Price</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.order_items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.product_name}</td>
                      <td className="px-4 py-3 text-gray-500">{item.pack_size}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.price_snapshot)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-700">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-henna-700">{formatCurrency(order.total_amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Status Update */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Update Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-henna-500"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-henna-500 resize-none"
                placeholder="Internal notes about this order..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold bg-henna-600 hover:bg-henna-700 text-white rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main AdminOrders ─────────────────────────────────────────────────────────

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*, order_items(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }
      if (search.trim()) {
        query = query.or(`id.ilike.%${search.trim()}%,user_id.ilike.%${search.trim()}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      setOrders((data as OrderWithItems[]) ?? []);
      setTotalCount(count ?? 0);
    } catch (err: unknown) {
      toast.error('Failed to load orders: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, page]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleQuickStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    setUpdatingStatus(null);
    if (error) {
      toast.error('Failed to update: ' + error.message);
    } else {
      toast.success('Status updated');
      fetchOrders();
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalCount} total orders</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search by order ID or user ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-henna-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-henna-200 border-t-henna-600 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left font-semibold text-gray-600">Order ID</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-gray-600">Customer</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-gray-600">Items</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-gray-600">Total</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-gray-600">Payment</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {order.id.substring(0, 8)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-gray-500">{order.user_id.substring(0, 12)}…</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{formatDate(order.created_at)}</td>
                    <td className="px-5 py-3.5 text-right text-gray-600">{order.order_items.length}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-gray-800">{formatCurrency(order.total_amount)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${paymentStatusColor[order.payment_status]}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${orderStatusColor[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-henna-600 border border-henna-200 rounded-lg hover:bg-henna-50 transition-colors"
                        >
                          Detail
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => handleQuickStatusUpdate(order.id, e.target.value as OrderStatus)}
                          disabled={updatingStatus === order.id}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-henna-500 disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={fetchOrders}
        />
      )}
    </div>
  );
};

export default AdminOrders;
