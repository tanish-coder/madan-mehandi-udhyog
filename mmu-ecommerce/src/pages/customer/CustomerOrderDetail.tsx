import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Order, OrderItem } from '../../types/database';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Printer,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export default function CustomerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-100">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-3">
        <h3 className="font-display text-lg font-bold text-gray-900">Order not found</h3>
        <p className="text-xs text-gray-500">The requested order could not be located.</p>
        <Link to="/account/orders" className="btn-primary text-xs inline-flex">
          Back to Orders
        </Link>
      </div>
    );
  }

  const addr = order.shipping_address as Record<string, string> | null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/account/orders"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">
              Order #{order.id.slice(0, 8)}
            </h2>
            <p className="text-xs text-gray-400">
              Placed on {new Date(order.created_at).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="btn-secondary text-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Invoice</span>
        </button>
      </div>

      {/* Items Table */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <div className="p-4 bg-gray-50/80 font-bold text-xs uppercase tracking-wider text-gray-600 border-b border-gray-100">
          Purchased Botanical Powders
        </div>
        <div className="divide-y divide-gray-100">
          {order.order_items?.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{item.product_name}</h4>
                <p className="text-gray-400 mt-0.5">
                  Pack: {item.pack_size || '100 gm'} &bull; Quantity: {item.quantity}
                </p>
              </div>
              <span className="font-bold text-gray-900 text-sm">
                ₹{Number(item.subtotal).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals Breakdown */}
        <div className="p-4 bg-gray-50/60 border-t border-gray-100 space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-bold text-gray-900">₹{Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className="font-bold text-gray-900">
              {order.shipping_amount > 0 ? `₹${Number(order.shipping_amount).toFixed(2)}` : 'FREE'}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-gray-900">
            <span>Total Paid</span>
            <span className="text-henna-700 font-display text-lg">
              ₹{Number(order.total_amount).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {addr && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-1">
          <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1">
            Delivery Destination
          </span>
          <p className="font-bold text-gray-900 text-sm">{addr.full_name}</p>
          <p>{addr.line1}</p>
          {addr.line2 && <p>{addr.line2}</p>}
          <p>
            {addr.city}, {addr.state} — {addr.postal_code}
          </p>
          {addr.phone && <p className="text-henna-700 font-semibold pt-1">Phone: {addr.phone}</p>}
        </div>
      )}
    </div>
  );
}
