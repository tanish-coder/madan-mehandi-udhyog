import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import { CartProvider } from './context/CartContext';

// Layouts
const PublicLayout = lazy(() => import('./components/layout/PublicLayout'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const CustomerLayout = lazy(() => import('./pages/customer/CustomerLayout'));

// Public pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Wholesale = lazy(() => import('./pages/Wholesale'));
const Manufacturing = lazy(() => import('./pages/Manufacturing'));
const Enquiry = lazy(() => import('./pages/Enquiry'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Contact = lazy(() => import('./pages/Contact'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));

// Auth pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

// Customer account pages
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const CustomerOrders = lazy(() => import('./pages/customer/CustomerOrders'));
const CustomerOrderDetail = lazy(() => import('./pages/customer/CustomerOrderDetail'));
const CustomerEnquiries = lazy(() => import('./pages/customer/CustomerEnquiries'));
const CustomerManufacturing = lazy(() => import('./pages/customer/CustomerManufacturing'));
const CustomerProfile = lazy(() => import('./pages/customer/CustomerProfile'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminEnquiries = lazy(() => import('./pages/admin/AdminEnquiries'));
const AdminManufacturing = lazy(() => import('./pages/admin/AdminManufacturing'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminCustomizer = lazy(() => import('./pages/admin/AdminCustomizer'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-henna-200 border-t-henna-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Loading MMU Sojat...</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteProvider>
          <CartProvider>
            <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#1f2937',
                  borderRadius: '12px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  iconTheme: { primary: '#c06720', secondary: '#fff' },
                },
              }}
            />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Storefront Routes with PublicLayout */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:slug" element={<ProductDetails />} />
                  <Route path="/wholesale" element={<Wholesale />} />
                  <Route path="/manufacturing" element={<Manufacturing />} />
                  <Route path="/enquiry" element={<Enquiry />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                </Route>

                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Customer Account Routes */}
                <Route path="/account" element={<CustomerLayout />}>
                  <Route index element={<CustomerDashboard />} />
                  <Route path="orders" element={<CustomerOrders />} />
                  <Route path="orders/:id" element={<CustomerOrderDetail />} />
                  <Route path="enquiries" element={<CustomerEnquiries />} />
                  <Route path="manufacturing-enquiries" element={<CustomerManufacturing />} />
                  <Route path="profile" element={<CustomerProfile />} />
                </Route>

                {/* Admin Portal Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<AdminProductForm />} />
                  <Route path="products/:id/edit" element={<AdminProductForm />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="orders/:id" element={<AdminOrderDetail />} />
                  <Route path="enquiries" element={<AdminEnquiries />} />
                  <Route path="manufacturing" element={<AdminManufacturing />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="customizer" element={<AdminCustomizer />} />
                  <Route path="videos" element={<Navigate to="/admin/customizer?tab=about_media" replace />} />
                  <Route path="about-videos" element={<Navigate to="/admin/customizer?tab=about_media" replace />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </SiteProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
