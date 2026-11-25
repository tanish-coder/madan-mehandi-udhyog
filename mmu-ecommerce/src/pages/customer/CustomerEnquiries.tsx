import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Enquiry } from '../../types/database';
import {
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Package,
  Globe,
  Phone,
  MessageCircle,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

const STATUS_STYLES: Record<string, { bg: string; label: string }> = {
  new:     { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'New / Pending Review' },
  read:    { bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Reviewed by Team' },
  replied: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Replied' },
  closed:  { bg: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Closed' },
};

export default function CustomerEnquiries() {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnquiries = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let query = supabase
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (user.email) {
          query = query.or(`user_id.eq.${user.id},email.eq."${user.email}"`);
        } else {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;
        if (error) throw error;
        setEnquiries(data || []);
      } catch (err) {
        console.error('Failed to load enquiries', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, [user]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-100">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Loading your enquiries...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-6">
      <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">
            My Enquiries ({enquiries.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track general, wholesale, and product questions submitted to our factory desk
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/enquiry"
            className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Raise New Enquiry</span>
          </Link>
          <Link
            to="/wholesale"
            className="btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Wholesale Quote</span>
          </Link>
        </div>
      </div>

      {enquiries.length === 0 ? (
        <div className="py-16 text-center space-y-3 text-xs text-gray-400">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="font-medium text-gray-700 text-sm">No enquiries raised yet.</p>
          <p className="max-w-sm mx-auto">
            Have a question about bulk Sojat henna, custom pricing, or export logistics? Submit an enquiry and track it right here.
          </p>
          <div className="pt-2">
            <Link to="/enquiry" className="btn-primary text-xs inline-flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Submit First Enquiry</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => {
            const statusInfo = STATUS_STYLES[enq.status] || {
              bg: 'bg-henna-100 text-henna-800 border-henna-200',
              label: enq.status,
            };

            return (
              <div
                key={enq.id}
                className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3 text-xs hover:border-henna-200 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-900">
                      {enq.product_interest || 'General Enquiry'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                      {enq.type}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.bg}`}
                  >
                    {enq.status === 'replied' || enq.status === 'closed' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>{statusInfo.label}</span>
                  </span>
                </div>

                {(enq.quantity_required || enq.country || enq.phone) && (
                  <div className="flex flex-wrap gap-3 text-[11px] text-gray-600">
                    {enq.quantity_required && (
                      <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-100">
                        <Package className="w-3 h-3 text-henna-600" />
                        Qty: <strong>{enq.quantity_required}</strong>
                      </span>
                    )}
                    {enq.country && (
                      <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-100">
                        <Globe className="w-3 h-3 text-henna-600" />
                        {enq.country}
                      </span>
                    )}
                    {enq.phone && (
                      <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-100">
                        <Phone className="w-3 h-3 text-henna-600" />
                        {enq.phone}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-gray-700 bg-white p-3.5 rounded-xl border border-gray-100 leading-relaxed">
                  &ldquo;{enq.message}&rdquo;
                </p>

                {enq.admin_notes && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      MMU Team Response
                    </span>
                    <p className="text-xs leading-relaxed">{enq.admin_notes}</p>
                  </div>
                )}

                <div className="text-[11px] text-gray-400 pt-1 flex items-center justify-between">
                  <span>Ref: #{enq.id.slice(0, 8).toUpperCase()}</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Submitted on {new Date(enq.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
