import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  Factory,
  Star,
  Users,
  Settings,
  Palette,
  Film,
  Bell,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSite } from '../../context/SiteContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin', end: true },
  { label: 'Site Customizer', icon: Palette, to: '/admin/customizer', end: true },
  { label: 'About Videos & Media', icon: Film, to: '/admin/customizer?tab=about_media' },
  { label: 'Products', icon: Package, to: '/admin/products' },
  { label: 'Orders', icon: ShoppingBag, to: '/admin/orders' },
  { label: 'Enquiries', icon: MessageSquare, to: '/admin/enquiries' },
  { label: 'Manufacturing', icon: Factory, to: '/admin/manufacturing' },
  { label: 'Reviews', icon: Star, to: '/admin/reviews' },
  { label: 'Customers', icon: Users, to: '/admin/customers' },
  { label: 'Notifications & SMTP', icon: Bell, to: '/admin/settings?tab=notifications' },
  { label: 'Settings', icon: Settings, to: '/admin/settings' },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { user, profile, signOut } = useAuth();
  const { customization } = useSite();
  const navigate = useNavigate();
  const location = useLocation();

  const isItemActive = (to: string) => {
    if (to.includes('?tab=')) {
      const tabName = to.split('?tab=')[1];
      if (to.startsWith('/admin/customizer')) {
        return location.pathname === '/admin/customizer' && location.search.includes(`tab=${tabName}`);
      }
      if (to.startsWith('/admin/settings')) {
        return location.pathname === '/admin/settings' && location.search.includes(`tab=${tabName}`);
      }
    }
    if (to === '/admin/settings') {
      return location.pathname === '/admin/settings' && (!location.search || !location.search.includes('tab=notifications'));
    }
    if (to === '/admin/customizer') {
      return (
        location.pathname === '/admin/customizer' &&
        (!location.search || location.search.includes('tab=slider'))
      );
    }
    if (to === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(to);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Admin';
  const displayEmail = user?.email || '';
  const avatarInitials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          bg-white border-r border-gray-200 shadow-sm
          transition-transform duration-300 ease-in-out
          w-[260px]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{ width: 260 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {customization?.logo_url ? (
              <img
                src={customization.logo_url}
                alt="MMU Logo"
                className="w-11 h-11 rounded-xl object-contain bg-white p-0.5 border-2 border-henna-600 shadow-xs flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : null}
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-henna-600 leading-none">MMU</span>
              <p className="text-xs text-gray-400 font-medium mt-0.5 tracking-wider uppercase">
                Admin Panel
              </p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-0.5">
            {navItems.map(({ label, icon: Icon, to, end }) => {
              const active = isItemActive(to);
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={() => {
                      // close sidebar on mobile after navigation
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={() =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                        active
                          ? 'bg-henna-600 text-white shadow-sm font-semibold'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
                    <span>{label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section at bottom */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-henna-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-henna-600">{avatarInitials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
