import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Enquiry } from '../../types/database';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Eye,
  Mail,
  Phone,
  Globe,
  Package,
  Calendar,
  X,
  Save,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'general' | 'wholesale'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected enquiry for side drawer view / update
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<'new' | 'read' | 'replied' | 'closed'>('new');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnquiries(data || []);
    } catch (err: any) {
      toast.error('Failed to load enquiries: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const openEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setAdminNotes(enquiry.admin_notes || '');
    setStatusUpdate(enquiry.status);

    // If status is new, automatically mark as read
    if (enquiry.status === 'new') {
      supabase
        .from('enquiries')
        .update({ status: 'read' })
        .eq('id', enquiry.id)
        .then(() => {
          setEnquiries((prev) =>
            prev.map((e) => (e.id === enquiry.id ? { ...e, status: 'read' } : e))
          );
        });
    }
  };

  const handleSaveEnquiry = async () => {
    if (!selectedEnquiry) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({
          status: statusUpdate,
          admin_notes: adminNotes,
        })
        .eq('id', selectedEnquiry.id);

      if (error) throw error;

      setEnquiries((prev) =>
        prev.map((e) =>
          e.id === selectedEnquiry.id
            ? { ...e, status: statusUpdate, admin_notes: adminNotes }
            : e
        )
      );
      toast.success('Enquiry updated successfully');
      setSelectedEnquiry(null);
    } catch (err: any) {
      toast.error('Failed to update enquiry: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.product_interest && e.product_interest.toLowerCase().includes(search.toLowerCase())) ||
      (e.country && e.country.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'all' || e.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const newCount = enquiries.filter((e) => e.status === 'new').length;
  const wholesaleCount = enquiries.filter((e) => e.type === 'wholesale').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-gray-900">Enquiries & Leads</h1>
            {newCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 animate-pulse">
                {newCount} New
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Track customer questions, bulk requirements, and worldwide wholesale enquiries
          </p>
        </div>

        <button
          onClick={fetchEnquiries}
          className="self-start sm:self-auto p-2.5 text-gray-500 hover:text-henna-700 hover:bg-henna-50 rounded-xl border border-gray-200 transition-colors inline-flex items-center gap-2 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Type Tabs & Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                typeFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({enquiries.length})
            </button>
            <button
              onClick={() => setTypeFilter('wholesale')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                typeFilter === 'wholesale'
                  ? 'bg-white text-henna-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Wholesale Leads</span>
              <span className="px-1.5 py-0.5 rounded-full bg-henna-100 text-henna-800 text-[10px]">
                {wholesaleCount}
              </span>
            </button>
            <button
              onClick={() => setTypeFilter('general')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                typeFilter === 'general'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              General Retail
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-henna-500 font-medium text-gray-700"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by sender name, email, product or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-henna-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500">Loading enquiries from Supabase...</p>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700">No enquiries found</h3>
            <p className="text-xs text-gray-500 mt-1">There are no matching submissions at this time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Sender & Contact</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Product Interest & Qty</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredEnquiries.map((enquiry) => (
                  <tr
                    key={enquiry.id}
                    onClick={() => openEnquiry(enquiry)}
                    className="hover:bg-henna-50/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{enquiry.full_name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {enquiry.email}
                        </span>
                        {enquiry.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {enquiry.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          enquiry.type === 'wholesale'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {enquiry.type === 'wholesale' ? 'Wholesale' : 'General'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800 text-xs line-clamp-1">
                        {enquiry.product_interest || 'General information'}
                      </div>
                      {enquiry.quantity_required && (
                        <div className="text-[11px] text-henna-700 font-semibold mt-0.5">
                          Qty: {enquiry.quantity_required}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-600 text-xs">
                      {enquiry.country || 'India'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          enquiry.status === 'new'
                            ? 'bg-amber-100 text-amber-800'
                            : enquiry.status === 'read'
                            ? 'bg-blue-100 text-blue-800'
                            : enquiry.status === 'replied'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(enquiry.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEnquiry(enquiry);
                        }}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Slideover Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-slide-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-henna-600">
                  {selectedEnquiry.type} Enquiry
                </span>
                <h3 className="font-display text-xl font-bold text-gray-900 mt-0.5">
                  {selectedEnquiry.full_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Email Address</span>
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="font-semibold text-henna-700 hover:underline block mt-0.5"
                  >
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Phone / WhatsApp</span>
                  <span className="font-semibold text-gray-800 block mt-0.5">
                    {selectedEnquiry.phone || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Country / Region</span>
                  <span className="font-semibold text-gray-800 block mt-0.5">
                    {selectedEnquiry.country || 'India'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Received Date</span>
                  <span className="font-semibold text-gray-800 block mt-0.5">
                    {new Date(selectedEnquiry.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Requirement Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Requirement Details
                </h4>
                <div className="p-4 rounded-xl border border-gray-200 space-y-2 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block">Product of Interest:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedEnquiry.product_interest || 'General enquiry'}
                    </span>
                  </div>
                  {selectedEnquiry.quantity_required && (
                    <div>
                      <span className="text-xs text-gray-400 block">Quantity Required:</span>
                      <span className="font-bold text-henna-700">
                        {selectedEnquiry.quantity_required}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400 block mb-1">Customer Message:</span>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg leading-relaxed text-xs">
                      {selectedEnquiry.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Update & Notes */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin Action & Notes
                </h4>

                <div>
                  <label className="label">Update Status</label>
                  <select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value as any)}
                    className="input text-sm"
                  >
                    <option value="new">New (Unprocessed)</option>
                    <option value="read">Read (Reviewed)</option>
                    <option value="replied">Replied (Contacted customer)</option>
                    <option value="closed">Closed (Completed)</option>
                  </select>
                </div>

                <div>
                  <label className="label">Internal Notes / Log</label>
                  <textarea
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Record notes on email sent, quotation shared, phone call outcome..."
                    className="input text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <a
                href={`mailto:${selectedEnquiry.email}?subject=Response from Madan Mehandi Udhyog (MMU)&body=Dear ${selectedEnquiry.full_name},%0D%0A%0D%0AThank you for reaching out to Madan Mehandi Udhyog regarding your requirement.`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs"
              >
                <Mail className="w-4 h-4 text-henna-600" />
                <span>Send Email</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEnquiry}
                  disabled={isUpdating}
                  className="btn-primary text-xs"
                >
                  {isUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
