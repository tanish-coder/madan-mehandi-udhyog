import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemsCount,
    subtotal,
    shippingFee,
    freeShippingThreshold,
    totalAmount,
  } = useCart();

  const navigate = useNavigate();
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-henna-50 border border-henna-100 flex items-center justify-center mx-auto text-henna-600">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-display text-3xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
          Discover our 15 pure Sojat henna and Ayurvedic botanical powders at factory-direct pricing of ₹299 per 100 gm.
        </p>
        <div className="pt-2">
          <Link to="/products" className="btn-primary text-xs px-6 py-3 shadow-md">
            <span>Explore Product Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Shopping Cart ({itemsCount})
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Pure Sojat natural powders directly from our Rajasthan mills
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-gray-400 hover:text-red-600 underline transition"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Shipping Progress Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-800 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-henna-600" />
            {amountNeededForFreeShipping > 0 ? (
              <>
                Add <strong className="text-henna-700">₹{amountNeededForFreeShipping.toFixed(2)}</strong> more for FREE Shipping!
              </>
            ) : (
              <span className="text-green-700 font-bold">
                🎉 Congratulations! You unlocked FREE India Shipping.
              </span>
            )}
          </span>
          <span className="text-gray-400 font-mono text-[11px]">
            Threshold: ₹{freeShippingThreshold}
          </span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-henna-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-xs divide-y divide-gray-100 overflow-hidden">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-earth-100 border border-earth-200 flex items-center justify-center font-display font-bold text-2xl text-henna-700 flex-shrink-0">
                  {item.product.name.charAt(0)}
                </div>
                <div>
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="font-display font-bold text-base text-gray-900 hover:text-henna-700 transition"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pack: {item.packSize || '100 gm'} &bull; Single Price: ₹{Number(item.product.price).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Quantity Selector & Item Subtotal */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <div className="flex items-center border border-gray-200 rounded-xl bg-white">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-2 text-gray-500 hover:text-henna-700 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 font-bold text-xs text-gray-900 min-w-[28px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-2 text-gray-500 hover:text-henna-700 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="font-display font-bold text-base text-gray-900 block">
                    ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-[11px] text-red-500 hover:text-red-700 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="p-4 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <Link to="/products" className="hover:text-henna-700 font-semibold inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
            <span>All prices in Indian Rupees (INR)</span>
          </div>
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="font-display text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({itemsCount} items)</span>
              <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Estimated Shipping</span>
              <span className="font-bold text-gray-900">
                {shippingFee === 0 ? (
                  <span className="text-green-700 font-bold uppercase">FREE</span>
                ) : (
                  `₹${shippingFee.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between text-sm font-bold text-gray-900">
              <span>Total Payable</span>
              <span className="text-henna-700 font-display text-xl">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn-primary w-full justify-center py-3.5 text-sm shadow-md hover:shadow-lg"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Trust Guarantees */}
          <div className="space-y-2 pt-4 border-t border-gray-100 text-[11px] text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-henna-600 flex-shrink-0" />
              <span>100% Secure Checkout with Supabase Auth</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-henna-600 flex-shrink-0" />
              <span>Dispatched directly from Sojat City Mill</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
