import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  MapPin,
  Phone,
  Mail,
  Send,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Star,
  Clock,
  Building,
  ArrowRight,
} from 'lucide-react';

export default function Contact() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
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
      const { error } = await supabase.from('enquiries').insert({
        user_id: user?.id || null,
        full_name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        product_interest: form.subject.trim() || 'General Contact',
        message: form.message.trim(),
        type: 'general',
        status: 'new',
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Your message has been sent to MMU Sojat!');
    } catch (err: any) {
      toast.error('Failed to send message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-henna-700">
          Get in Touch
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-gray-900">
          Contact Madan Mehandi Udhyog
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Connect directly with our Sojat City manufacturing headquarters, domestic wholesale sales, or export desk.
        </p>
      </div>

      {/* Main Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-henna-950 via-earth-900 to-henna-900 text-white rounded-3xl p-8 sm:p-10 space-y-8 shadow-xl">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-henna-300">
              Registered Facility
            </span>
            <h3 className="font-display text-2xl font-bold text-white mt-1">
              Madan Mehandi Udhyog
            </h3>
            <p className="text-xs text-earth-300 mt-2">
              Industrial Area, 3rd Phase, Sojat City, District Pali, Rajasthan 306104, India
            </p>
          </div>

          <div className="space-y-4 text-xs text-earth-200 border-t border-white/10 pt-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-henna-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block">Factory Location</span>
                <span>Industrial Area, 3rd Phase, Sojat City, Rajasthan 306104</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-henna-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block">Phone &amp; WhatsApp</span>
                <a
                  href="https://wa.me/917976705440?text=Hello%20Madan%20Mehandi%20Udhyog,%20I%20would%20like%20to%20chat%20with%20you."
                  target="_blank"
                  rel="noreferrer"
                  className="text-henna-300 hover:text-white underline font-semibold transition inline-flex items-center gap-1.5"
                >
                  <span>+91 79767 05440</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold no-underline">Chat with Us</span>
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-henna-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block">Email Enquiries</span>
                <span>contact@madanmehandi.com / export@madanmehandi.com</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-henna-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block">Business Hours</span>
                <span>Monday – Saturday: 9:00 AM – 7:00 PM IST (Closed Sundays)</span>
              </div>
            </div>
          </div>

          {/* Google Business Rating */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="font-bold text-xs text-white">4.9 Google Rating</span>
            </div>
            <a
              href="https://maps.google.com/?q=Sojat+City+Rajasthan"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-henna-300 hover:text-white font-semibold inline-flex items-center gap-1"
            >
              <span>View Verified Google Business Profile</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10 space-y-6">
          <div className="space-y-1">
            <h3 className="font-display text-2xl font-bold text-gray-900">
              Send a Message
            </h3>
            <p className="text-xs text-gray-500">
              Fill out the form below and an MMU representative will reply within 24 hours.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-green-50 border border-green-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-display text-xl font-bold text-green-900">
                Message Sent Successfully!
              </h4>
              <p className="text-xs text-green-700 max-w-sm mx-auto">
                Thank you for reaching out to Madan Mehandi Udhyog. We will contact you at <strong>{form.email}</strong> shortly.
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
                      name: profile?.full_name || '',
                      email: user?.email || '',
                      phone: profile?.phone || '',
                      subject: '',
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">
                    Email Address <span className="text-red-500">*</span>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 94141 12345"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g. Bulk order inquiry"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="How can we assist your henna requirement?"
                  className="input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-sm shadow-md"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send Message to Sojat Factory</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Embedded Map Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-gray-900">
              Interactive Factory Map Pin
            </h3>
            <p className="text-xs text-gray-500">
              Located directly inside Sojat City’s recognized Phase 3 Industrial Cluster
            </p>
          </div>
          <a
            href="https://maps.google.com/?q=Sojat+City+Rajasthan"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary text-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <MapPin className="w-3.5 h-3.5 text-henna-600" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
        </div>

        <div className="rounded-2xl overflow-hidden border border-gray-200 h-[400px]">
          <iframe
            title="Madan Mehandi Udhyog Factory Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57500!2d73.66!3d25.92!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x394200c5c8e3cf3b%3A0xb35a7be3c41!2sSojat%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
