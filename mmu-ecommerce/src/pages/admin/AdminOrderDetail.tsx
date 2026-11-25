import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Order, OrderItem } from '../../types/database';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Save,
  Printer,
  Loader2,
  CheckCircle,
  Truck,
  Clock,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Order['status']>('pending');
  const [paymentStatus, setPaymentStatus] = useState<Order['payment_status']>('pending');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setOrder(data);
        setStatus(data.status);
        setPaymentStatus(data.payment_status);
        setNotes(data.notes || '');
      } catch (err: any) {
        toast.error('Failed to load order: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          payment_status: paymentStatus,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Order details updated successfully');
    } catch (err: any) {
      toast.error('Failed to update order: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Loading order #{id?.slice(0, 8)}...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 max-w-lg mx-auto mt-12">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-800">Order not found</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6">The requested order does not exist or has been removed.</p>
        <Link to="/admin/orders" className="btn-primary text-xs">
          Back to Orders
        </Link>
      </div>
    );
  }

  const addr = order.shipping_address as Record<string, string> | null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Order #{order.id.slice(0, 8)}
              </h1>
              <span className="font-mono text-xs text-gray-400">({order.id})</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Placed on {new Date(order.created_at).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs inline-flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-xs inline-flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Order</span>
          </button>
        </div>
      </div>

      {/* Main Order Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (Items + Address) */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-henna-600" />
                Purchased Products ({order.order_items?.length || 0})
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {order.order_items?.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{item.product_name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Pack Size: {item.pack_size || '100 gm'} &bull; Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">
                      ₹{Number(item.subtotal).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      ₹{Number(item.price_snapshot).toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal & Totals Breakdown */}
            <div className="p-5 bg-gray-50/70 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">₹{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span className="font-medium text-gray-900">
                  {order.shipping_amount > 0 ? `₹${Number(order.shipping_amount).toFixed(2)}` : 'FREE'}
                </span>
              </div>
              {order.tax_amount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Applicable GST</span>
                  <span className="font-medium text-gray-900">₹{Number(order.tax_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-gray-900">
                <span>Total Amount</span>
                <span className="text-henna-700">₹{Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
            <h2 className="font-display text-base font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-henna-600" />
              Delivery Destination
            </h2>
            {addr ? (
              <div className="text-xs text-gray-700 space-y-1 bg-gray-50 p-4 rounded-xl">
                <p className="font-bold text-gray-900 text-sm">{addr.full_name}</p>
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>
                  {addr.city}, {addr.state} — {addr.postal_code}
                </p>
                <p className="font-medium text-gray-600">{addr.country || 'India'}</p>
                {addr.phone && (
                  <p className="text-henna-700 font-semibold pt-1">Phone: {addr.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No structured shipping address attached.</p>
            )}
          </div>
        </div>

        {/* Right Column (Status & Actions) */}
        <div className="space-y-6">
          {/* Order Status Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="font-display text-sm font-bold text-gray-900 uppercase tracking-wider">
              Fulfillment Status
            </h3>

            <div>
              <label className="label">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="input text-xs font-semibold capitalize"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="label">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="input text-xs font-semibold capitalize"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="label">Payment Method</label>
              <p className="text-xs font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                {order.payment_method || 'Online / UPI'}
              </p>
            </div>

            <div>
              <label className="label">Admin / Dispatch Notes</label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter courier tracking ID, special packing notes..."
                className="input text-xs"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full justify-center text-xs py-2.5"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Status & Notes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
