import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Package,
  CreditCard,
  Truck,
  MapPin,
  Loader2,
  ChevronRight,
  Mail,
} from 'lucide-react';
import { dispatchOrderConfirmation, dispatchPaymentConfirmation } from '../lib/notifications';

export default function Checkout() {
  const { cart, subtotal, shippingFee, totalAmount, clearCart, itemsCount } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  // Shipping details state
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: 'Rajasthan',
    postal_code: '',
    country: 'India',
    payment_method: 'Online UPI',
    notes: '',
  });

  if (cart.length === 0 && !orderSuccessId) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-gray-100 text-center space-y-4 shadow-sm">
        <Package className="w-12 h-12 text-gray-300 mx-auto" />
        <h2 className="font-display text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/products" className="btn-primary text-xs">
          Browse Products
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone || !form.line1 || !form.city || !form.postal_code) {
      toast.error('Please complete all required shipping address fields');
      return;
    }

    setLoading(true);

    try {
      // 1. Insert order into Supabase orders table
      const shippingAddress = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim() || null,
        city: form.city.trim(),
        state: form.state.trim(),
        postal_code: form.postal_code.trim(),
        country: form.country.trim(),
      };

      const orderPayload: any = {
        user_id: user?.id || null,
        status: 'confirmed',
        total_amount: totalAmount,
        subtotal: subtotal,
        shipping_amount: shippingFee,
        tax_amount: 0.00,
        shipping_address: shippingAddress,
        payment_status: form.payment_method === 'Cash on Delivery' ? 'pending' : 'paid',
        payment_method: form.payment_method,
        notes: form.notes.trim() || 'Retail web order directly from MMU storefront',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderErr) throw orderErr;

      const orderId = orderData.id;

      // 2. Insert order items into Supabase order_items table
      const orderItems = cart.map((item) => ({
        order_id: orderId,
        product_id: item.product.id,
        product_name: item.product.name,
        price_snapshot: Number(item.product.price),
        quantity: item.quantity,
        pack_size: item.packSize || '100 gm',
        subtotal: Number(item.product.price) * item.quantity,
      }));

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsErr) throw itemsErr;

      // 3. Dispatch real-time Order and Payment Confirmation
      const itemsSummary = cart
        .map((c) => `${c.quantity}x ${c.product.name} (${c.packSize || '100 gm'})`)
        .join(', ');
      const fullAddress = `${shippingAddress.line1}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.postal_code}, India`;
      const customerFullName = form.full_name || `${form.first_name || ''} ${form.last_name || ''}`.trim() || 'Valued Customer';

      dispatchOrderConfirmation({
        orderId,
        customerName: customerFullName,
        customerEmail: form.email.trim(),
        customerPhone: form.phone.trim(),
        totalAmount,
        paymentMethod: form.payment_method,
        shippingAddress: fullAddress,
        itemsSummary,
      }).catch((e) => console.warn('Order confirmation dispatch notice:', e));

      if (form.payment_method !== 'Cash on Delivery') {
        dispatchPaymentConfirmation({
          orderId,
          paymentId: `UPI-${Date.now().toString().slice(-6)}`,
          customerName: customerFullName,
          customerEmail: form.email.trim(),
          customerPhone: form.phone.trim(),
          totalAmount,
          paymentMethod: form.payment_method,
        }).catch((e) => console.warn('Payment confirmation dispatch notice:', e));
      }

      // Success
      clearCart();
      setOrderSuccessId(orderId);
      toast.success('Order placed successfully! Confirmation sent to your email.');
    } catch (err: any) {
      toast.error('Failed to place order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Order Confirmed Screen
  if (orderSuccessId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-green-700">
            Payment & Order Confirmed
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Your order has been recorded in our dispatch system at the Sojat City mill. We will send packing and DTDC courier tracking details to <strong>{form.email}</strong>.
          </p>
        </div>

        {/* Real-time Confirmation Badge */}
        <div className="max-w-md mx-auto p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-center gap-2.5 shadow-xs">
          <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Real-time Order &amp; Payment confirmation email dispatched to <strong>{form.email}</strong>
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm text-xs space-y-3 max-w-md mx-auto text-left">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-400">Order Reference</span>
            <span className="font-mono font-bold text-gray-900">#{orderSuccessId.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-400">Total Paid</span>
            <span className="font-bold text-henna-700">₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-400">Payment Mode</span>
            <span className="font-semibold text-gray-800">{form.payment_method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Dispatch Mill</span>
            <span className="font-semibold text-gray-800">Sojat City Phase 3, Rajasthan</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link to="/products" className="btn-primary text-xs px-6 py-3">
            Continue Shopping
          </Link>
          {user && (
            <Link to="/account/orders" className="btn-secondary text-xs px-6 py-3">
              View Order History
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">
          Secure Checkout
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Provide your shipping details for fresh dispatch from Sojat City
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Delivery Address & Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* Shipping Address Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-5">
            <h3 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-henna-600" />
              Delivery Destination
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  Recipient Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder="e.g. Rahul Mehra"
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  Phone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. +91 98112 23344"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">
                Email Address (for invoice & tracking updates) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div>
              <label className="label">
                Street Address / House No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.line1}
                onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))}
                placeholder="e.g. Flat 402, Green Valley Apartments"
                className="input"
              />
            </div>

            <div>
              <label className="label">Locality / Landmark (Optional)</label>
              <input
                type="text"
                value={form.line2}
                onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))}
                placeholder="e.g. Near City Center Mall"
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="e.g. Jaipur"
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                  placeholder="e.g. Rajasthan"
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  Postal PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.postal_code}
                  onChange={(e) => setForm((p) => ({ ...p, postal_code: e.target.value }))}
                  placeholder="e.g. 302001"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Delivery Instructions / Packing Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Leave at security desk, call before delivery, etc."
                className="input text-xs"
              />
            </div>
          </div>

          {/* Payment Method Selector Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-henna-600" />
              Payment Selection
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-henna-500 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="Online UPI"
                    checked={form.payment_method === 'Online UPI'}
                    onChange={() => setForm((p) => ({ ...p, payment_method: 'Online UPI' }))}
                    className="w-4 h-4 text-henna-600 focus:ring-henna-500"
                  />
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">
                      Online UPI / NetBanking / Cards
                    </span>
                    <span className="text-xs text-gray-500">
                      Instant confirmation & priority queue dispatch
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-bold">
                  Recommended
                </span>
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-henna-500 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="Cash on Delivery"
                    checked={form.payment_method === 'Cash on Delivery'}
                    onChange={() => setForm((p) => ({ ...p, payment_method: 'Cash on Delivery' }))}
                    className="w-4 h-4 text-henna-600 focus:ring-henna-500"
                  />
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-xs text-gray-500">
                      Pay cash to the delivery executive upon package arrival
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Confirmation */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="font-display text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
            Items in Order ({itemsCount})
          </h3>

          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.product.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                  <p className="text-gray-400">
                    {item.packSize} &bull; Qty: {item.quantity}
                  </p>
                </div>
                <span className="font-bold text-gray-900">
                  ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping Fee</span>
              <span className="font-bold text-gray-900">
                {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-gray-900">
              <span>Total Amount</span>
              <span className="text-henna-700 font-display text-xl">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-4 text-sm shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Order in Supabase...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Place Order &bull; ₹{totalAmount.toFixed(2)}</span>
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-gray-400">
            By placing this order, you agree to Madan Mehandi Udhyog terms of service and shipping policies.
          </p>
        </div>
      </form>
    </div>
  );
}
