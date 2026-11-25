import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  Factory,
  Sparkles,
  CheckCircle2,
  Box,
  Layers,
  Send,
  Loader2,
  ShieldCheck,
  FileCheck,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

export default function Manufacturing() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    country: '',
    brand_name: '',
    products_required: '',
    estimated_quantity: '',
    packaging_requirements: '',
    message: '',
  });

  useEffect(() => {
    if (user || profile) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || profile?.full_name || '',
        email: prev.email || user?.email || '',
        phone: prev.phone || profile?.phone || '',
      }));
    }
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('manufacturing_enquiries').insert({
        user_id: user?.id || null,
        name: form.name.trim(),
        company_name: form.company_name.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        country: form.country.trim() || 'India',
        brand_name: form.brand_name.trim() || null,
        products_required: form.products_required.trim() || null,
        estimated_quantity: form.estimated_quantity.trim() || null,
        packaging_requirements: form.packaging_requirements.trim() || null,
        message: form.message.trim() || null,
        status: 'new',
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Private-label manufacturing enquiry received!');
    } catch (err: any) {
      toast.error('Failed to submit request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-henna-950 via-earth-900 to-henna-900 rounded-3xl p-8 sm:p-14 lg:p-20 text-white shadow-xl relative overflow-hidden text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-henna-200">
          <Factory className="w-4 h-4 text-henna-400" />
          <span>Turnkey Contract Manufacturing & Formulation</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
          Start Your Own Natural Product Brand with MMU.
        </h1>

        <p className="text-earth-200 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
          From sourcing pure Sojat henna leaves and grinding Ayurvedic botanicals to custom-printed foil pouching and international export clearance — we handle manufacturing while you build your brand.
        </p>
      </div>

      {/* 5-Step Process Section */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-henna-700">
            Our Transparent Process
          </span>
          <h2 className="font-display text-3xl font-bold text-gray-900">
            How Private-Label Manufacturing Works
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            A seamless five-step roadmap from initial concept to finished packaged goods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
            <span className="w-8 h-8 rounded-full bg-henna-100 text-henna-700 font-bold flex items-center justify-center text-xs">
              01
            </span>
            <h3 className="font-display font-bold text-base text-gray-900">Share Requirements</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Tell us your brand vision, target markets, desired pack formats, and launch timelines.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
            <span className="w-8 h-8 rounded-full bg-henna-100 text-henna-700 font-bold flex items-center justify-center text-xs">
              02
            </span>
            <h3 className="font-display font-bold text-base text-gray-900">Select Products</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Choose single powders or proprietary Ayurvedic blends from our 15 certified powders.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
            <span className="w-8 h-8 rounded-full bg-henna-100 text-henna-700 font-bold flex items-center justify-center text-xs">
              03
            </span>
            <h3 className="font-display font-bold text-base text-gray-900">Branding & Packaging</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We design and print stand-up pouches, luxury tins, cones, or bulk poly-sacks with your logo.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
            <span className="w-8 h-8 rounded-full bg-henna-100 text-henna-700 font-bold flex items-center justify-center text-xs">
              04
            </span>
            <h3 className="font-display font-bold text-base text-gray-900">Confirm Specs</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Approve pilot pre-production samples, laboratory test reports, and commercial terms.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
            <span className="w-8 h-8 rounded-full bg-henna-100 text-henna-700 font-bold flex items-center justify-center text-xs">
              05
            </span>
            <h3 className="font-display font-bold text-base text-gray-900">Full Production</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Batch manufacturing, nitrogen flushing, vacuum sealing, and worldwide door-to-door delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Contract Manufacturing Request Form */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12 lg:p-16 max-w-4xl mx-auto">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-henna-700">
            Confidential Consultation
          </span>
          <h2 className="font-display text-3xl font-bold text-gray-900">
            Submit Private-Label Brand Enquiry
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Our contract manufacturing division treats all client formulas, brand concepts, and designs with strict NDA confidentiality.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-2xl bg-green-50 border border-green-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-green-900">
              Request Received Successfully!
            </h3>
            <p className="text-xs text-green-700 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{form.name}</strong>. Our third-party manufacturing manager will review your project brief for <strong>{form.brand_name || 'your proposed brand'}</strong> and email full MOQ and die-line packaging templates to <strong>{form.email}</strong>.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              {user && (
                <Link
                  to="/account/manufacturing-enquiries"
                  className="btn-primary text-xs inline-flex items-center gap-1.5"
                >
                  <span>View in My Manufacturing Requests</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    name: profile?.full_name || '',
                    company_name: '',
                    email: user?.email || '',
                    phone: profile?.phone || '',
                    country: '',
                    brand_name: '',
                    products_required: '',
                    estimated_quantity: '',
                    packaging_requirements: '',
                    message: '',
                  });
                }}
                className="btn-secondary text-xs"
              >
                Submit Another Project
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Vikramaditya Roy"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Company / Business Name</label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
                  placeholder="e.g. Aura Botanica Pvt Ltd"
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="label">
                  Business Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. founder@aurabotanica.in"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. +91 98765 43210"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Country</label>
                <input
                  type="text"
                  required
                  value={form.country}
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                  placeholder="e.g. India, UAE, USA"
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Proposed Brand Name</label>
                <input
                  type="text"
                  value={form.brand_name}
                  onChange={(e) => setForm((p) => ({ ...p, brand_name: e.target.value }))}
                  placeholder="e.g. Aura Pure Naturals"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Estimated Initial Batch Volume</label>
                <input
                  type="text"
                  value={form.estimated_quantity}
                  onChange={(e) => setForm((p) => ({ ...p, estimated_quantity: e.target.value }))}
                  placeholder="e.g. 5,000 pouches or 500 kg"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Products Required for Formulation</label>
              <input
                type="text"
                value={form.products_required}
                onChange={(e) => setForm((p) => ({ ...p, products_required: e.target.value }))}
                placeholder="e.g. Organic Henna, Indigo, Moringa, Rose Petal Powder"
                className="input"
              />
            </div>

            <div>
              <label className="label">Packaging Requirements & Finishes</label>
              <input
                type="text"
                value={form.packaging_requirements}
                onChange={(e) => setForm((p) => ({ ...p, packaging_requirements: e.target.value }))}
                placeholder="e.g. 100g Matte Stand-up zipper pouches, Gold Foil stamp, Kraft paper boxes"
                className="input"
              />
            </div>

            <div>
              <label className="label">Additional Project Details / Certifications Needed</label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Tell us about your brand ethos, target launch window, certifications required..."
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
                  <span>Submitting Confidential Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Private Label Project</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
