import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Order, Enquiry, ManufacturingEnquiry } from '../../types/database';
import {
  ShoppingBag,
  MessageSquare,
  Factory,
  Plus,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function CustomerDashboard() {
  const { user, profile } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [mfgCount, setMfgCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let enqQuery = supabase
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        let mfgQuery = supabase
          .from('manufacturing_enquiries')
          .select('id', { count: 'exact', head: true });

        if (user.email) {
          enqQuery = enqQuery.or(`user_id.eq.${user.id},email.eq."${user.email}"`);
          mfgQuery = mfgQuery.or(`user_id.eq.${user.id},email.eq."${user.email}"`);
        } else {
          enqQuery = enqQuery.eq('user_id', user.id);
          mfgQuery = mfgQuery.eq('user_id', user.id);
        }

        const [ordersRes, enqRes, mfgRes] = await Promise.all([
          supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3),
          enqQuery,
          mfgQuery,
        ]);

        if (ordersRes.data) setRecentOrders(ordersRes.data);
        if (enqRes.data) setRecentEnquiries(enqRes.data);
        if (typeof mfgRes.count === 'number') setMfgCount(mfgRes.count);
      } catch (err) {
        console.error('Failed to load customer dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-100">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Loading your account history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-henna-900 to-earth-900 text-white rounded-3xl p-6 sm:p-8 space-y-2 shadow-sm">
        <span className="text-xs text-henna-300 font-bold uppercase tracking-wider">
          Customer Portal
        </span>
        <h2 className="font-display text-2xl font-bold">
          Welcome back, {profile?.full_name || 'Customer'}!
        </h2>
        <p className="text-xs text-earth-300 max-w-xl leading-relaxed">
          Track active shipments, view past tax invoices, manage bulk enquiries, and check private label brand progress.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Orders Placed</span>
            <span className="font-display text-3xl font-bold text-gray-900 mt-1 block">
              {recentOrders.length}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-henna-50 text-henna-700 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <Link
          to="/account/enquiries"
          className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs flex items-center justify-between hover:border-henna-200 transition"
        >
          <div>
            <span className="text-xs text-gray-400 block font-medium">My Enquiries</span>
            <span className="font-display text-3xl font-bold text-gray-900 mt-1 block">
              {recentEnquiries.length}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-henna-50 text-henna-700 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </Link>

        <Link
          to="/account/manufacturing-enquiries"
          className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs flex items-center justify-between hover:border-henna-200 transition"
        >
          <div>
            <span className="text-xs text-gray-400 block font-medium">OEM Requests</span>
            <span className="font-display text-3xl font-bold text-gray-900 mt-1 block">
              {mfgCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-henna-50 text-henna-700 flex items-center justify-center">
            <Factory className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Recent Enquiries */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <h3 className="font-display text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-henna-600" />
            Recent Enquiries
          </h3>
          <div className="flex items-center gap-3">
            <Link to="/enquiry" className="text-xs font-semibold text-gray-600 hover:text-henna-700 inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Raise New
            </Link>
            <Link to="/account/enquiries" className="text-xs font-bold text-henna-700 hover:underline">
              View All Enquiries &rarr;
            </Link>
          </div>
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 space-y-2">
            <p>You have not raised any enquiries yet.</p>
            <Link to="/enquiry" className="btn-primary text-xs inline-flex items-center gap-1.5 mt-2">
              <Plus className="w-3.5 h-3.5" /> Submit an Enquiry
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 space-y-2 text-xs transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-gray-900">
                      {enq.product_interest || 'General Enquiry'}
                    </span>
                    <span className="text-gray-400 ml-2 uppercase text-[10px] font-semibold">
                      ({enq.type})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-henna-100 text-henna-800 capitalize">
                      {enq.status}
                    </span>
                    <span className="text-gray-400 text-[11px]">
                      {new Date(enq.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 line-clamp-2">{enq.message}</p>
                {enq.admin_notes && (
                  <p className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                    Reply: {enq.admin_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="font-display text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-henna-600" />
            Recent Purchases
          </h3>
          <Link to="/account/orders" className="text-xs font-bold text-henna-700 hover:underline">
            View All Orders &rarr;
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 space-y-2">
            <p>You have not placed any orders yet.</p>
            <Link to="/products" className="btn-primary text-xs inline-flex items-center gap-1.5 mt-2">
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 flex items-center justify-between text-xs transition"
              >
                <div>
                  <span className="font-mono font-bold text-gray-900">
                    Order #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-gray-400 ml-2">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-900">
                    ₹{Number(order.total_amount).toFixed(2)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-henna-100 text-henna-800 capitalize">
                    {order.status}
                  </span>
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="btn-secondary text-[11px] px-2.5 py-1"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
