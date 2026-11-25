import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
} from 'lucide-react';

export default function Enquiry() {
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
        product_interest: form.product_interest.trim() || null,
        quantity_required: form.quantity_required.trim() || null,
        message: form.message.trim(),
        type: 'general',
        status: 'new',
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Your message has been sent to MMU!');
    } catch (err: any) {
      toast.error('Failed to send message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-henna-100 text-henna-800 text-xs font-semibold">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>We're Here to Help</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">
          General & Product Enquiry
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Have questions regarding our Sojat henna recipes, pack options, or retail orders? Send us a note below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Details Card */}
        <div className="md:col-span-5 bg-gradient-to-br from-henna-950 via-earth-900 to-henna-900 text-white rounded-3xl p-8 space-y-6 shadow-lg">
          <div>
            <span className="text-xs text-henna-300 font-semibold uppercase tracking-wider block">
              Direct Factory Office
            </span>
            <h3 className="font-display text-2xl font-bold text-white mt-1">
              Madan Mehandi Udhyog
            </h3>
          </div>

          <p className="text-xs text-earth-200 leading-relaxed">
            Our customer assistance and export desks are open Monday through Saturday from 9:00 AM to 7:00 PM IST.
          </p>

          <div className="space-y-4 text-xs text-earth-300 border-t border-white/10 pt-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-henna-400 flex-shrink-0 mt-0.5" />
              <span>Industrial Area, 3rd Phase, Sojat City, Rajasthan 306104, India</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-henna-400 flex-shrink-0" />
              <a
                href="https://wa.me/917976705440?text=Hello%20MMU,%20I%20have%20an%20enquiry%20regarding%20bulk%20henna%20and%20powders."
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition underline"
              >
                +91 79767 05440 (Chat with Us / Call)
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-henna-400 flex-shrink-0" />
              <span>contact@madanmehandi.com</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-earth-200">
            <span className="font-bold text-henna-300 block mb-1">Fast Response Guarantee:</span>
            We respond to inquiries within 1 business day.
          </div>
        </div>

        {/* Enquiry Form */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-green-900">
                Message Received!
              </h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                Thank you for contacting MMU. A representative will get in touch with you at <strong>{form.email}</strong> shortly.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
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
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder="e.g. Kavita Sharma"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="kavita@gmail.com"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 99887 76655"
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Country / City</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                    placeholder="India, Jaipur"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Product of Interest</label>
                  <input
                    type="text"
                    value={form.product_interest}
                    onChange={(e) => setForm((p) => ({ ...p, product_interest: e.target.value }))}
                    placeholder="e.g. 3 Filter Henna / Rose Powder"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  Your Message or Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us what you would like to know..."
                  className="input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-sm shadow-md"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
