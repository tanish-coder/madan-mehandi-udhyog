import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  Globe,
  Truck,
  Ship,
  FileCheck,
  ShieldCheck,
  Package,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Mail,
  Building,
  ArrowRight,
} from 'lucide-react';

export default function Wholesale() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    product_interest: '',
    quantity_required: '',
    message: '',
  });

  useEffect(() => {
    if (user || profile) {
      setForm((prev) => ({
        ...prev,
        full_name: prev.full_name || profile?.full_name || '',
        email: prev.email || user?.email || '',
        phone: prev.phone || profile?.phone || '',
      }));
    }
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('enquiries').insert({
        user_id: user?.id || null,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        country: form.country.trim() || 'India',
        product_interest: form.product_interest.trim() || 'Wholesale Henna & Herbal Powders',
        quantity_required: form.quantity_required.trim() || null,
        message: form.message.trim(),
        type: 'wholesale',
        status: 'new',
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Wholesale enquiry submitted to MMU factory office!');
    } catch (err: any) {
      toast.error('Failed to submit enquiry: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-henna-950 via-earth-900 to-henna-900 rounded-3xl p-8 sm:p-14 lg:p-20 text-white shadow-xl relative overflow-hidden text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-henna-200">
          <Globe className="w-3.5 h-3.5 text-henna-400" />
          <span>Serving Salons, Cosmetic Brands & Importers Across 40+ Countries</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
          Worldwide Wholesale Henna & <br />
          <span className="text-gradient from-henna-400 to-amber-300">
            Ayurvedic Herb Supply
          </span>
        </h1>

        <p className="text-earth-200 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
          Direct factory export of pure Sojat henna powder and 14 natural Ayurvedic ingredient powders. Available in bulk bags (25kg / 50kg), master cartons, or customized retail pouching with international phytosanitary certificates.
        </p>
      </div>

      {/* Export Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-henna-100 text-henna-700 flex items-center justify-center">
            <Ship className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-gray-900">Container Logistics</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Full Container Loads (FCL 20ft / 40ft) and Less than Container Loads (LCL) dispatched via Mundra & Nhava Sheva sea ports on CIF, FOB, or EXW terms.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-henna-100 text-henna-700 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-gray-900">Bulk Packaging Options</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Double-lined high-barrier poly-lined bags (25kg / 50kg), moisture-sealed drums, or custom pre-printed stand-up retail pouches ready for store shelves.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-henna-100 text-henna-700 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-gray-900">Lab Testing & COA</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Batch-specific Certificates of Analysis (COA) confirming zero chemicals, zero PPD, heavy-metal safety thresholds, and Government Phytosanitary inspection.
          </p>
        </div>
      </div>

      {/* Wholesale Enquiry Form Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12 lg:p-16 max-w-4xl mx-auto">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-henna-700">
            Factory Direct Quotation
          </span>
          <h2 className="font-display text-3xl font-bold text-gray-900">
            Request Wholesale Price Sheet & Samples
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Share your quantity requirements and port of destination. Our export team responds within 24 hours.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-2xl bg-green-50 border border-green-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-green-900">
              Enquiry Submitted Successfully!
            </h3>
            <p className="text-xs text-green-700 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{form.full_name}</strong>. Our export team at Sojat City has received your requirement. We will review and send our wholesale quotation to <strong>{form.email}</strong> shortly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              {user && (
                <Link
                  to="/account/enquiries"
                  className="btn-primary text-xs inline-flex items-center gap-1.5"
                >
                  <span>View in My Enquiries</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    full_name: profile?.full_name || '',
                    email: user?.email || '',
                    phone: profile?.phone || '',
                    country: '',
                    product_interest: '',
                    quantity_required: '',
                    message: '',
                  });
                }}
                className="btn-secondary text-xs"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">
                  Your Name / Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder="e.g. Elena Rostova"
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  Business Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. elena@salonchain.com"
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Phone / WhatsApp Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. +7 916 123 4567"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Destination Country & Port</label>
                <input
                  type="text"
                  required
                  value={form.country}
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                  placeholder="e.g. Russia, Saint Petersburg"
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Products of Interest</label>
                <input
                  type="text"
                  value={form.product_interest}
                  onChange={(e) => setForm((p) => ({ ...p, product_interest: e.target.value }))}
                  placeholder="e.g. 3 Filter Henna & Indigo Powder"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Estimated Quantity Required</label>
                <input
                  type="text"
                  value={form.quantity_required}
                  onChange={(e) => setForm((p) => ({ ...p, quantity_required: e.target.value }))}
                  placeholder="e.g. 500 kg or 1 FCL 20ft container"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">
                Detailed Requirement / Packaging Specifications <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Mention any custom mesh size requirements, private labeling requirements, target timeline..."
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-sm shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Enquiry...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Wholesale Enquiry</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
