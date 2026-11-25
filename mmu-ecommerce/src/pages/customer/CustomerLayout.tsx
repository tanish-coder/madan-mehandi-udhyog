import React from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  Factory,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function CustomerLayout() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, to: '/account', end: true },
    { label: 'My Orders', icon: ShoppingBag, to: '/account/orders' },
    { label: 'My Enquiries', icon: MessageSquare, to: '/account/enquiries' },
    { label: 'Manufacturing Requests', icon: Factory, to: '/account/manufacturing' },
    { label: 'Profile & Addresses', icon: User, to: '/account/profile' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Customer Header */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-henna-100 text-henna-800 font-display font-bold text-2xl flex items-center justify-center shadow-xs">
            {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-henna-700">
              Customer Account
            </span>
            <h1 className="font-display text-2xl font-bold text-gray-900">
              {profile?.full_name || 'Valued Customer'}
            </h1>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-secondary text-xs px-4 py-2 self-start sm:self-auto text-red-600 hover:bg-red-50 hover:border-red-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Grid: Sidebar + Sub-page content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-xs p-3 space-y-1">
          {navItems.map(({ label, icon: Icon, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-henna-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </NavLink>
          ))}
        </aside>

        {/* Content Outlet */}
        <div className="lg:col-span-9">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
