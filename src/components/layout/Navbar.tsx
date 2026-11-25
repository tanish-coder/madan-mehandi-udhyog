import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import { useSite } from '../../context/SiteContext';
import {
  ShoppingBag,
  User,
  Menu,
  X,
  Globe,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Package,
  MessageSquare,
  Factory,
  KeyRound,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { itemsCount } = useCart();
  const { customization } = useSite();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Products', to: '/products' },
    { label: 'Wholesale', to: '/wholesale' },
    { label: 'Private Label', to: '/manufacturing' },
    { label: 'Contact', to: '/contact' },
  ];

  const logoUrl = customization?.logo_url;

  return (
    <header className="sticky top-0 z-40 bg-white/97 backdrop-blur-md border-b border-gray-100 shadow-sm">
      {/* Announcement Banner */}
      <div className="bg-gradient-to-r from-henna-950 via-earth-900 to-henna-900 text-white text-[11px] py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-henna-400 animate-pulse flex-shrink-0" />
            <span className="truncate">
              {customization?.announcement_text || 'Pure Sojat Henna directly from Rajasthan • Uniform pricing ₹299 per 100 gm'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-earth-300 flex-shrink-0">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-henna-400" />
              Worldwide Shipping
            </span>
            <span>&bull;</span>
            <Link to="/manufacturing" className="text-henna-300 hover:text-white underline whitespace-nowrap">
              Start Your Brand
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.5rem] sm:min-h-[5.25rem] lg:min-h-[5.75rem] py-2 gap-4">

          {/* ── LEFT: Logo ── */}
          <Link to="/" className="flex items-center gap-3 sm:gap-3.5 group flex-shrink-0 min-w-0">
            {/* Logo Image (admin-uploaded) or SVG fallback */}
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="MMU Logo"
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl object-contain bg-white p-0.5 border-2 border-henna-600 shadow-md group-hover:scale-105 transition-transform duration-200 flex-shrink-0"
                onError={(e) => {
                  // fallback to SVG icon if image fails
                  const el = e.target as HTMLImageElement;
                  el.style.display = 'none';
                  const next = el.nextElementSibling as HTMLElement | null;
                  if (next) next.style.display = 'flex';
                }}
              />
            ) : null}
            {/* SVG fallback icon — always rendered, hidden when image loads */}
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-henna-700 to-henna-900 text-white flex items-center justify-center font-display font-bold text-2xl shadow-md group-hover:scale-105 transition-transform duration-200 flex-shrink-0 select-none ${logoUrl ? 'hidden' : 'flex'}`}
              aria-hidden="true"
            >
              M
            </div>

            <div className="min-w-0 hidden xs:block sm:block">
              <span className="font-display font-extrabold text-sm sm:text-base lg:text-lg tracking-tight text-gray-900 group-hover:text-henna-700 transition block leading-tight truncate">
                Madan Mehandi Udhyog
              </span>
              <p className="text-[10px] sm:text-[11px] font-semibold text-henna-700 tracking-wider uppercase leading-none mt-0.5">
                Sojat City &bull; Since 1990
              </p>
            </div>
            {/* Short name on tiny screens */}
            <span className="font-display font-extrabold text-base text-gray-900 group-hover:text-henna-700 transition block sm:hidden leading-tight">
              MMU
            </span>
          </Link>

          {/* ── CENTER: Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-henna-50 text-henna-800 font-bold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* ── RIGHT: Actions ── */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 sm:p-2.5 rounded-xl text-gray-700 hover:text-henna-700 hover:bg-henna-50 transition border border-transparent hover:border-henna-100"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-henna-600 text-white font-bold text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm leading-none px-1">
                  {itemsCount > 99 ? '99+' : itemsCount}
                </span>
              )}
            </Link>

            {/* Auth / Profile Dropdown */}
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-2 pl-2 pr-2.5 sm:pr-3 py-1.5 rounded-2xl border transition-all duration-150 ${
                    profileDropdownOpen
                      ? 'bg-henna-50 border-henna-300 ring-2 ring-henna-200'
                      : 'bg-white hover:bg-gray-50 border-gray-200 shadow-xs'
                  }`}
                  aria-expanded={profileDropdownOpen}
                  aria-label="User profile and dashboard menu"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-henna-600 to-henna-800 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left hidden sm:block max-w-[110px]">
                    <span className="block text-xs font-bold text-gray-900 truncate leading-tight">
                      {profile?.full_name?.split(' ')[0] || (isAdmin ? 'Admin' : 'Account')}
                    </span>
                    <span className="block text-[10px] text-henna-600 font-semibold leading-tight capitalize">
                      {isAdmin ? 'Admin' : 'Dashboard'}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-henna-700' : ''}`} />
                </button>

                {/* Floating Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 divide-y divide-gray-100">
                    {/* User Summary Header */}
                    <div className="px-4 py-3 bg-gradient-to-br from-henna-50/60 to-earth-50/40">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {profile?.full_name || 'Valued Customer'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {user.email}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white border border-henna-200 text-henna-800 shadow-2xs">
                        {isAdmin ? <ShieldCheck className="w-3 h-3 text-henna-600" /> : <Sparkles className="w-3 h-3 text-henna-600" />}
                        <span>{isAdmin ? 'Store Administrator' : 'Verified Member'}</span>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-1 text-xs text-gray-700">
                      <Link
                        to={isAdmin ? '/admin' : '/account'}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-henna-50 hover:text-henna-900 transition font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-henna-600" />
                        <span>{isAdmin ? 'Admin Control Dashboard' : 'My Account Dashboard'}</span>
                      </Link>

                      <Link
                        to="/account/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-henna-50 hover:text-henna-900 transition font-medium"
                      >
                        <KeyRound className="w-4 h-4 text-henna-600" />
                        <span>Profile &amp; Password Update</span>
                      </Link>

                      <Link
                        to="/account/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-henna-50 hover:text-henna-900 transition font-medium"
                      >
                        <Package className="w-4 h-4 text-henna-600" />
                        <span>My Orders &amp; Invoices</span>
                      </Link>

                      <Link
                        to="/account/enquiries"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-henna-50 hover:text-henna-900 transition font-medium"
                      >
                        <MessageSquare className="w-4 h-4 text-henna-600" />
                        <span>My Product Enquiries</span>
                      </Link>

                      <Link
                        to="/account/manufacturing"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-henna-50 hover:text-henna-900 transition font-medium"
                      >
                        <Factory className="w-4 h-4 text-henna-600" />
                        <span>Private Label Requests</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition font-semibold text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-henna-600 hover:bg-henna-700 text-white text-xs font-semibold shadow-sm hover:shadow transition whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Top-Right Most Official Logo Photo */}
            {customization?.show_top_right_logo && logoUrl && (
              <Link
                to="/"
                className="hidden sm:flex items-center pl-2.5 border-l border-gray-200 flex-shrink-0"
                title="Madan Mehandi Udhyog — Official Seal"
              >
                <img
                  src={logoUrl}
                  alt="MMU Official Brand Logo"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain bg-white p-0.5 border-2 border-henna-600 shadow-sm hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-xl animate-slide-in">
          {/* Mobile logo row */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="MMU Logo"
                className="w-12 h-12 rounded-2xl object-contain bg-white p-0.5 border-2 border-henna-600 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-henna-700 to-henna-900 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">M</div>
            )}
            <div>
              <p className="font-display font-bold text-sm text-gray-900">Madan Mehandi Udhyog</p>
              <p className="text-[10px] font-semibold text-henna-700 uppercase tracking-wide">Sojat City • Since 1990</p>
            </div>
          </div>

          <div className="p-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-henna-50 hover:text-henna-800 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-2">
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 text-sm font-semibold text-gray-800"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-henna-600" />
                <span>Shopping Cart</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-henna-600 text-white text-xs font-bold min-w-[22px] text-center">
                {itemsCount}
              </span>
            </Link>

            {user ? (
              <div className="space-y-1.5 pt-1">
                <div className="px-3.5 py-2.5 bg-gradient-to-br from-henna-50 to-earth-50 rounded-2xl border border-henna-100 mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{profile?.full_name || 'Valued Member'}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-henna-600 text-white">
                      {isAdmin ? 'Admin' : 'Member'}
                    </span>
                  </div>
                </div>

                <Link
                  to={isAdmin ? '/admin' : '/account'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gray-50 text-xs font-semibold text-gray-800 hover:bg-henna-50"
                >
                  <LayoutDashboard className="w-4 h-4 text-henna-600" />
                  <span>{isAdmin ? 'Admin Dashboard' : 'My Account Dashboard'}</span>
                </Link>

                <Link
                  to="/account/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gray-50 text-xs font-semibold text-gray-800 hover:bg-henna-50"
                >
                  <KeyRound className="w-4 h-4 text-henna-600" />
                  <span>Profile, Password &amp; Addresses</span>
                </Link>

                <Link
                  to="/account/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gray-50 text-xs font-semibold text-gray-800 hover:bg-henna-50"
                >
                  <Package className="w-4 h-4 text-henna-600" />
                  <span>My Orders</span>
                </Link>

                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 text-left mt-1"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3 rounded-xl bg-henna-600 text-white font-semibold text-sm shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
