import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import Spinner from '../ui/Spinner';

interface AdminLayoutProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ title = 'Dashboard', breadcrumbs }) => {
  const { user, profile, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area – pushed right on large screens */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px]">
        {/* Header */}
        <AdminHeader
          title={title}
          breadcrumbs={breadcrumbs}
          onToggleSidebar={() => setSidebarOpen((p) => !p)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
