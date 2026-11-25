import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, ChevronRight, ChevronDown, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSite } from '../../context/SiteContext';

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  onToggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, breadcrumbs, onToggleSidebar }) => {
  const { user, profile, signOut } = useAuth();
  const { customization } = useSite();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Admin';
  const avatarInitials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 min-h-[4.5rem] py-2 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 lg:px-6 gap-4">
      {/* Hamburger – visible on mobile only */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Title + Breadcrumbs */}
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1 text-xs text-gray-400 mb-0.5" aria-label="breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight size={12} className="text-gray-300" />}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-henna-600 transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-500">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : null}
        <h1 className="text-lg font-bold text-gray-800 truncate leading-tight">{title}</h1>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((p) => !p)}
            className="relative p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {/* Badge */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-henna-600 rounded-full ring-2 ring-white" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Notifications
              </p>
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* User avatar / dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-henna-100 flex items-center justify-center">
              <span className="text-xs font-bold text-henna-600">{avatarInitials}</span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setDropdownOpen(false); navigate('/admin/settings'); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <User size={15} />
                Profile Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Top-Right Most Logo Photo */}
        {customization.show_top_right_logo && customization.logo_url && (
          <div className="pl-3 border-l border-gray-200 hidden sm:flex items-center" title="MMU Official Brand">
            <img
              src={customization.logo_url}
              alt="MMU Logo"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain bg-white p-0.5 border-2 border-henna-600 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
