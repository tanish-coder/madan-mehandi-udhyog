import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile, Order } from '../../types/database';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  ExternalLink,
  X,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function AdminCustomers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');

  // Customer detail modal
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingCustomerOrders, setLoadingCustomerOrders] = useState(false);

  // Role change dialog
  const [roleDialogUser, setRoleDialogUser] = useState<Profile | null>(null);
  const [targetRole, setTargetRole] = useState<'customer' | 'admin'>('customer');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err: any) {
      toast.error('Failed to load profiles: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const openCustomerDetail = async (customer: Profile) => {
    setSelectedCustomer(customer);
    setLoadingCustomerOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', customer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomerOrders(data || []);
    } catch (err: any) {
      toast.error('Failed to load customer orders: ' + err.message);
    } finally {
      setLoadingCustomerOrders(false);
    }
  };

  const initiateRoleChange = (profile: Profile) => {
    const nextRole = profile.role === 'admin' ? 'customer' : 'admin';
    setRoleDialogUser(profile);
    setTargetRole(nextRole);
  };

  const confirmRoleChange = async () => {
    if (!roleDialogUser) return;
    setIsUpdatingRole(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: targetRole, updated_at: new Date().toISOString() })
        .eq('id', roleDialogUser.id);

      if (error) throw error;

      setProfiles((prev) =>
        prev.map((p) => (p.id === roleDialogUser.id ? { ...p, role: targetRole } : p))
      );
      toast.success(
        `User ${roleDialogUser.email} role changed to ${targetRole.toUpperCase()}`
      );
      setRoleDialogUser(null);
    } catch (err: any) {
      toast.error('Failed to update user role: ' + err.message);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      (p.full_name && p.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
      (p.phone && p.phone.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-gray-900">User Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-henna-100 text-henna-800">
              {profiles.length} Total Users
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer accounts, verify permissions, and configure administrator privileges
          </p>
        </div>

        <button
          onClick={fetchProfiles}
          className="self-start sm:self-auto p-2.5 text-gray-500 hover:text-henna-700 hover:bg-henna-50 rounded-xl border border-gray-200 transition-colors inline-flex items-center gap-2 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-400 font-medium">Role:</span>
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                roleFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Users ({profiles.length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                roleFilter === 'admin'
                  ? 'bg-white text-henna-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admins ({profiles.filter((p) => p.role === 'admin').length})
            </button>
            <button
              onClick={() => setRoleFilter('customer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                roleFilter === 'customer'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Customers ({profiles.filter((p) => p.role === 'customer').length})
            </button>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-henna-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500">Loading user profiles from Supabase...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700">No users found</h3>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProfiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className="hover:bg-henna-50/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-henna-100 border border-henna-200 text-henna-800 font-bold flex items-center justify-center text-xs">
                          {profile.full_name
                            ? profile.full_name.charAt(0).toUpperCase()
                            : profile.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {profile.full_name || 'Customer'}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            ID: {profile.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 text-xs">
                      <a href={`mailto:${profile.email}`} className="hover:text-henna-700">
                        {profile.email}
                      </a>
                    </td>
                    <td className="p-4 text-gray-600 text-xs">
                      {profile.phone || '—'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          profile.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {profile.role === 'admin' ? (
                          <Shield className="w-3 h-3 text-purple-600" />
                        ) : (
                          <UserCheck className="w-3 h-3 text-gray-500" />
                        )}
                        <span className="capitalize">{profile.role}</span>
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openCustomerDetail(profile)}
                        className="btn-secondary text-xs px-2.5 py-1"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => initiateRoleChange(profile)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition ${
                          profile.role === 'admin'
                            ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            : 'border-purple-200 text-purple-700 hover:bg-purple-50'
                        }`}
                      >
                        {profile.role === 'admin' ? 'Demote to Customer' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-slide-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-henna-100 text-henna-800 font-bold flex items-center justify-center">
                  {selectedCustomer.full_name
                    ? selectedCustomer.full_name.charAt(0)
                    : selectedCustomer.email.charAt(0)}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-gray-900">
                    {selectedCustomer.full_name || 'Customer Account'}
                  </h3>
                  <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Account Overview */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">User Role</span>
                  <span className="font-bold text-gray-900 capitalize block mt-0.5">
                    {selectedCustomer.role}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Phone Number</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">
                    {selectedCustomer.phone || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Account ID</span>
                  <span className="font-mono text-[11px] text-gray-600 block mt-0.5">
                    {selectedCustomer.id}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Registered On</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">
                    {new Date(selectedCustomer.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-henna-600" />
                  Order History ({customerOrders.length})
                </h4>

                {loadingCustomerOrders ? (
                  <div className="py-8 text-center">
                    <Spinner size="md" />
                  </div>
                ) : customerOrders.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                    No orders placed yet by this account.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-gray-800">
                            #{order.id.slice(0, 8)}
                          </span>
                          <span className="text-gray-400 ml-2">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">
                            ₹{Number(order.total_amount).toFixed(2)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 capitalize">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(roleDialogUser)}
        title={targetRole === 'admin' ? 'Grant Admin Privileges' : 'Revoke Admin Privileges'}
        message={
          targetRole === 'admin'
            ? `Granting administrator role to "${roleDialogUser?.email}" gives complete administrative access to products, pricing, orders, customer accounts, and database settings.`
            : `Are you sure you want to demote "${roleDialogUser?.email}" to a standard customer account?`
        }
        confirmText={
          isUpdatingRole
            ? 'Updating...'
            : targetRole === 'admin'
            ? 'Promote to Admin'
            : 'Demote to Customer'
        }
        cancelText="Cancel"
        variant={targetRole === 'admin' ? 'warning' : 'danger'}
        onConfirm={confirmRoleChange}
        onCancel={() => setRoleDialogUser(null)}
      />
    </div>
  );
}
