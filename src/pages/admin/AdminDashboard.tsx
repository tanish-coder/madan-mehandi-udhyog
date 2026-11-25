import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  MessageSquare,
  Users,
  Plus,
  ClipboardList,
  Star,
  Film,
  Palette,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { Order, Enquiry } from '../../types/database';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  products: number;
  orders: number;
  enquiries: number;
  customers: number;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-indigo-100 text-indigo-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
  refunded:   'bg-gray-100 text-gray-800',
  new:        'bg-orange-100 text-orange-800',
  read:       'bg-blue-100 text-blue-800',
  replied:    'bg-green-100 text-green-800',
  closed:     'bg-gray-100 text-gray-800',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className ?? ''}`} />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}

function StatCard({ label, value, icon, color, loading }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        {loading ? (
          <>
            <Skeleton className="h-7 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-gray-900">{value?.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats]           = useState<Stats>({ products: 0, orders: 0, enquiries: 0, customers: 0 });
  const [recentOrders, setRecentOrders]       = useState<Order[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [statsLoading, setStatsLoading]       = useState(true);
  const [ordersLoading, setOrdersLoading]     = useState(true);
  const [enquiriesLoading, setEnquiriesLoading] = useState(true);
  const [error, setError]                     = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: products },
          { count: orders },
          { count: enquiries },
          { count: customers },
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('enquiries').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
        ]);
        setStats({
          products:  products  ?? 0,
          orders:    orders    ?? 0,
          enquiries: enquiries ?? 0,
          customers: customers ?? 0,
        });
      } catch (err) {
        setError('Failed to load dashboard stats.');
        console.error(err);
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Fetch recent orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error: err } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        if (err) throw err;
        setRecentOrders((data as Order[]) ?? []);
      } catch (err) {
        console.error('Failed to load recent orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // Fetch recent enquiries
  useEffect(() => {
    async function fetchEnquiries() {
      try {
        const { data, error: err } = await supabase
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        if (err) throw err;
        setRecentEnquiries((data as Enquiry[]) ?? []);
      } catch (err) {
        console.error('Failed to load recent enquiries:', err);
      } finally {
        setEnquiriesLoading(false);
      }
    }
    fetchEnquiries();
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name ?? 'Admin'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">{today}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={stats.products}
          icon={<Package className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50"
          loading={statsLoading}
        />
        <StatCard
          label="Total Orders"
          value={stats.orders}
          icon={<ShoppingCart className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50"
          loading={statsLoading}
        />
        <StatCard
          label="Total Enquiries"
          value={stats.enquiries}
          icon={<MessageSquare className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
          loading={statsLoading}
        />
        <StatCard
          label="Total Customers"
          value={stats.customers}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/customizer?tab=about_media"
            className="inline-flex items-center gap-2 px-4 py-2 bg-henna-700 text-white rounded-lg text-sm font-medium hover:bg-henna-800 transition-colors shadow-xs"
          >
            <Film className="w-4 h-4" /> Edit About Videos
          </Link>
          <Link
            to="/admin/customizer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-earth-700 text-white rounded-lg text-sm font-medium hover:bg-earth-800 transition-colors shadow-xs"
          >
            <Palette className="w-4 h-4" /> Site Customizer
          </Link>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" /> View Orders
          </Link>
          <Link
            to="/admin/enquiries"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            <ClipboardList className="w-4 h-4" /> View Enquiries
          </Link>
          <Link
            to="/admin/reviews"
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
          >
            <Star className="w-4 h-4" /> Moderate Reviews
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-emerald-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID', 'Customer ID', 'Amount', 'Status', 'Date'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ordersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">
                      {order.user_id.slice(0, 8)}…
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₹{order.total_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Enquiries</h2>
          <Link to="/admin/enquiries" className="text-sm text-emerald-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Email', 'Type', 'Status', 'Date'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enquiriesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : recentEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                    No enquiries yet.
                  </td>
                </tr>
              ) : (
                recentEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{enq.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{enq.email}</td>
                    <td className="px-6 py-4 text-sm capitalize text-gray-700">{enq.type}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={enq.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(enq.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
