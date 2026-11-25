import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { ManufacturingEnquiry } from '../../types/database';
import toast from 'react-hot-toast';
import {
  Factory,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Eye,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Layers,
  Box,
  Calendar,
  X,
  Save,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function AdminManufacturing() {
  const [enquiries, setEnquiries] = useState<ManufacturingEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedEnquiry, setSelectedEnquiry] = useState<ManufacturingEnquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<
    'new' | 'reviewing' | 'quoted' | 'confirmed' | 'closed'
  >('new');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchManufacturing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('manufacturing_enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnquiries(data || []);
    } catch (err: any) {
      toast.error('Failed to load manufacturing enquiries: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturing();
  }, []);

  const openEnquiry = (enquiry: ManufacturingEnquiry) => {
    setSelectedEnquiry(enquiry);
    setAdminNotes(enquiry.admin_notes || '');
    setStatusUpdate(enquiry.status);

    if (enquiry.status === 'new') {
      supabase
        .from('manufacturing_enquiries')
        .update({ status: 'reviewing' })
        .eq('id', enquiry.id)
        .then(() => {
          setEnquiries((prev) =>
            prev.map((e) => (e.id === enquiry.id ? { ...e, status: 'reviewing' } : e))
          );
        });
    }
  };

  const handleSaveEnquiry = async () => {
    if (!selectedEnquiry) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('manufacturing_enquiries')
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
      toast.success('Manufacturing enquiry updated');
      setSelectedEnquiry(null);
    } catch (err: any) {
      toast.error('Failed to update: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.company_name && e.company_name.toLowerCase().includes(search.toLowerCase())) ||
      (e.brand_name && e.brand_name.toLowerCase().includes(search.toLowerCase())) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.country && e.country.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Private Label & Manufacturing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-henna-100 text-henna-800">
              {enquiries.length} Requests
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage third-party contract manufacturing and brand creation requests
          </p>
        </div>

        <button
          onClick={fetchManufacturing}
          className="self-start sm:self-auto p-2.5 text-gray-500 hover:text-henna-700 hover:bg-henna-50 rounded-xl border border-gray-200 transition-colors inline-flex items-center gap-2 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-400 font-medium">Status:</span>
          <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto w-full sm:w-auto">
            {['all', 'new', 'reviewing', 'quoted', 'confirmed', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  statusFilter === status
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search company, brand, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-henna-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500">Loading manufacturing requests...</p>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="py-16 text-center">
            <Factory className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700">No requests found</h3>
            <p className="text-xs text-gray-500 mt-1">There are no matching contract manufacturing submissions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Applicant & Company</th>
                  <th className="p-4">Brand Concept</th>
                  <th className="p-4">Products Requested</th>
                  <th className="p-4">Est. Quantity</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Received</th>
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
                      <div className="font-semibold text-gray-900">{enquiry.name}</div>
                      {enquiry.company_name && (
                        <div className="text-xs text-henna-700 font-medium">
                          {enquiry.company_name}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-0.5">{enquiry.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-earth-100 text-earth-800 text-xs font-bold font-serif">
                        <Sparkles className="w-3 h-3 text-henna-600" />
                        {enquiry.brand_name || 'To Be Decided'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-gray-800 font-medium line-clamp-2">
                        {enquiry.products_required || 'Custom Formulation'}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-semibold text-gray-700">
                      {enquiry.estimated_quantity || 'Flexible'}
                    </td>
                    <td className="p-4 text-xs text-gray-600">
                      {enquiry.country || 'India'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          enquiry.status === 'new'
                            ? 'bg-amber-100 text-amber-800'
                            : enquiry.status === 'reviewing'
                            ? 'bg-purple-100 text-purple-800'
                            : enquiry.status === 'quoted'
                            ? 'bg-blue-100 text-blue-800'
                            : enquiry.status === 'confirmed'
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
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slideout Detail Drawer */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-slide-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-henna-600">
                  Private Label Partnership
                </span>
                <h3 className="font-display text-xl font-bold text-gray-900 mt-0.5">
                  {selectedEnquiry.company_name || selectedEnquiry.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Brand Summary */}
              <div className="p-4 rounded-xl bg-henna-50 border border-henna-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-henna-700 font-semibold block">
                    Proposed Brand Name
                  </span>
                  <span className="font-display text-2xl font-bold text-henna-950 mt-0.5 block">
                    {selectedEnquiry.brand_name || 'Under Brand Formulation'}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-henna-700">
                  <Factory className="w-6 h-6" />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Applicant Name</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">{selectedEnquiry.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Registered Company</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">
                    {selectedEnquiry.company_name || 'Individual / Startup'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Email Address</span>
                  <a href={`mailto:${selectedEnquiry.email}`} className="font-semibold text-henna-700 hover:underline block mt-0.5">
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Phone / WhatsApp</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">
                    {selectedEnquiry.phone || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Country / Market</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">{selectedEnquiry.country || 'India'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Enquiry Date</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">
                    {new Date(selectedEnquiry.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Manufacturing Specs */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Contract Specifications
                </h4>
                <div className="p-4 rounded-xl border border-gray-200 space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 block">Products Required:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedEnquiry.products_required || 'Custom Ayurvedic Line'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Estimated Production Volume:</span>
                    <span className="font-bold text-henna-700">
                      {selectedEnquiry.estimated_quantity || 'To be finalized'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Packaging Requirements:</span>
                    <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-100 mt-1">
                      {selectedEnquiry.packaging_requirements || 'Standard packaging / MMU recommendation'}
                    </p>
                  </div>
                  {selectedEnquiry.message && (
                    <div>
                      <span className="text-xs text-gray-400 block">Project Brief / Remarks:</span>
                      <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-100 mt-1 whitespace-pre-wrap">
                        {selectedEnquiry.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Update & Notes */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Production Evaluation & Notes
                </h4>

                <div>
                  <label className="label">Workflow Stage</label>
                  <select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value as any)}
                    className="input text-sm"
                  >
                    <option value="new">New Lead</option>
                    <option value="reviewing">Under Technical & Capacity Review</option>
                    <option value="quoted">Quotation & MOQs Sent</option>
                    <option value="confirmed">Contract Confirmed & In Production</option>
                    <option value="closed">Closed / Archived</option>
                  </select>
                </div>

                <div>
                  <label className="label">Private Manufacturing Log</label>
                  <textarea
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Log technical specs, packaging foil dies, sample approval status, pricing agreed per kg..."
                    className="input text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <a
                href={`mailto:${selectedEnquiry.email}?subject=MMU Private Label Manufacturing - ${selectedEnquiry.brand_name || selectedEnquiry.company_name}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs"
              >
                <Mail className="w-4 h-4 text-henna-600" />
                <span>Contact Client</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveEnquiry}
                  disabled={isUpdating}
                  className="btn-primary text-xs"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
