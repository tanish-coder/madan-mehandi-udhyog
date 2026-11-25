import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { ManufacturingEnquiry } from '../../types/database';
import { Factory, Plus, MessageCircle } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function CustomerManufacturing() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ManufacturingEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let query = supabase
          .from('manufacturing_enquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (user.email) {
          query = query.or(`user_id.eq.${user.id},email.eq."${user.email}"`);
        } else {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;
        if (error) throw error;
        setRequests(data || []);
      } catch (err) {
        console.error('Failed to load manufacturing enquiries', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-100">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Loading manufacturing requests...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-6">
      <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">
            Private Label &amp; Manufacturing ({requests.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track contract manufacturing and custom branded packaging proposals
          </p>
        </div>

        <Link
          to="/manufacturing"
          className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Brand Enquiry</span>
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="py-16 text-center space-y-3 text-xs text-gray-400">
          <Factory className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="font-medium text-gray-700 text-sm">No active private-label requests.</p>
          <p>Interested in launching your own henna or cosmetic powder brand?</p>
          <div className="pt-2">
            <Link to="/manufacturing" className="btn-primary text-xs inline-flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Start OEM / Private Label Request</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-display font-bold text-base text-gray-900 block">
                    {req.brand_name || 'Brand Project'}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Company: {req.company_name || 'Individual'}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 capitalize">
                  {req.status}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-gray-100 space-y-1">
                <div>
                  <span className="text-gray-400">Formulation Requested: </span>
                  <span className="font-semibold text-gray-800">{req.products_required || 'Custom'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Target Quantity: </span>
                  <span className="font-semibold text-henna-700">{req.estimated_quantity || 'Flexible'}</span>
                </div>
                {req.packaging_requirements && (
                  <div>
                    <span className="text-gray-400">Packaging: </span>
                    <span className="text-gray-700">{req.packaging_requirements}</span>
                  </div>
                )}
              </div>

              {req.message && (
                <p className="text-gray-600 bg-white p-3 rounded-xl border border-gray-100 leading-relaxed">
                  &ldquo;{req.message}&rdquo;
                </p>
              )}

              {req.admin_notes && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    MMU Manufacturing Team Response
                  </span>
                  <p className="text-xs leading-relaxed">{req.admin_notes}</p>
                </div>
              )}

              <div className="text-[11px] text-gray-400 pt-1">
                Submitted on {new Date(req.created_at).toLocaleDateString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
