import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../types/database';
import {
  ShoppingBag,
  Package,
  Calendar,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function CustomerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-100">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Loading your purchase history...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">
            My Orders ({orders.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track fulfillment and delivery progress for your Sojat henna orders
          </p>
        </div>
        <Link to="/products" className="btn-secondary text-xs">
          Buy More Powders
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-display text-base font-bold text-gray-800">No orders placed yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Explore our catalogue of 15 authentic Rajasthani botanical powders at ₹299 per 100 gm.
          </p>
          <Link to="/products" className="btn-primary text-xs inline-flex mt-2">
            Explore Catalogue
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {orders.map((order) => (
            <div
              key={order.id}
              className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-gray-900 text-sm">
                    Order #{order.id.slice(0, 8)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-henna-100 text-henna-800 capitalize">
                    {order.status}
                  </span>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-3">
                  <span>Placed on {new Date(order.created_at).toLocaleDateString()}</span>
                  <span>&bull;</span>
                  <span>Payment: {order.payment_method || 'Online'}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 self-end sm:self-auto">
                <span className="font-display font-bold text-base text-gray-900">
                  ₹{Number(order.total_amount).toFixed(2)}
                </span>
                <Link
                  to={`/account/orders/${order.id}`}
                  className="btn-secondary text-xs px-3.5 py-1.5"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
