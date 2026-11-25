import React, { useEffect, useState, useCallback } from 'react';
import { Star, CheckCircle, XCircle, Trash2, Eye, EyeOff, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { Review } from '../../types/database';

type Tab = 'pending' | 'approved' | 'all';

interface ReviewWithProduct extends Review {
  products?: { name: string } | null;
}

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}
      />
    ))}
  </div>
);

const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmClass?: string;
}> = ({ open, title, description, onConfirm, onCancel, confirmLabel = 'Confirm', confirmClass = '' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${confirmClass || 'bg-red-600 hover:bg-red-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load reviews');
    } else {
      const list = (data || []) as ReviewWithProduct[];
      setReviews(list);
      const notes: Record<string, string> = {};
      list.forEach((r) => { notes[r.id] = r.admin_notes ?? ''; });
      setAdminNotes(notes);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const filtered = reviews.filter((r) => {
    if (activeTab === 'pending') return !r.is_approved;
    if (activeTab === 'approved') return r.is_approved;
    return true;
  }).filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.customer_name.toLowerCase().includes(q) ||
      (r.customer_country ?? '').toLowerCase().includes(q) ||
      r.content.toLowerCase().includes(q)
    );
  });

  const updateReview = async (id: string, patch: Partial<Pick<Review, 'is_approved' | 'is_featured'>>) => {
    setUpdating((p) => ({ ...p, [id]: true }));
    const { error } = await supabase.from('reviews').update(patch).eq('id', id);
    if (error) {
      toast.error('Update failed');
    } else {
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r));
      toast.success('Review updated');
    }
    setUpdating((p) => ({ ...p, [id]: false }));
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) {
      toast.error('Delete failed');
    } else {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Review deleted');
    }
    setConfirmDelete(null);
  };

  const saveNotes = async (id: string) => {
    setSavingNotes((p) => ({ ...p, [id]: true }));
    const { error } = await supabase.from('reviews').update({ admin_notes: adminNotes[id] }).eq('id', id);
    if (error) {
      toast.error('Could not save notes');
    } else {
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, admin_notes: adminNotes[id] } : r));
      toast.success('Notes saved');
    }
    setSavingNotes((p) => ({ ...p, [id]: false }));
  };

  const total = reviews.length;
  const pending = reviews.filter((r) => !r.is_approved).length;
  const approved = reviews.filter((r) => r.is_approved).length;
  const featured = reviews.filter((r) => r.is_featured).length;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'pending', label: 'Pending Approval', count: pending },
    { key: 'approved', label: 'Approved', count: approved },
    { key: 'all', label: 'All Reviews', count: total },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: total, color: 'text-gray-800' },
          { label: 'Pending', value: pending, color: 'text-amber-600' },
          { label: 'Approved', value: approved, color: 'text-green-600' },
          { label: 'Featured', value: featured, color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
          <div className="flex gap-1">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-henna-600 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {label}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{count}</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-henna-300 w-56"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">Loading reviews…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Star size={36} className="text-gray-200" />
            <p className="text-sm text-gray-400">No reviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Rating</th>
                  <th className="px-4 py-3 text-left">Review</th>
                  <th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-center">Approved</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((review) => {
                  const isExpanded = expandedId === review.id;
                  return (
                    <React.Fragment key={review.id}>
                      <tr className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{review.customer_name}</p>
                          {review.customer_country && (
                            <p className="text-xs text-gray-400">{review.customer_country}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {(review.products as any)?.name ?? <span className="text-gray-300 italic">General</span>}
                        </td>
                        <td className="px-4 py-3">
                          <StarRating rating={review.rating} />
                          <span className="text-xs text-gray-400 mt-0.5">{review.rating}/5</span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          {review.title && (
                            <p className="font-medium text-gray-700 text-xs mb-0.5">{review.title}</p>
                          )}
                          <p className="text-gray-500 text-xs line-clamp-2">{review.content}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            disabled={updating[review.id]}
                            onClick={() => updateReview(review.id, { is_featured: !review.is_featured })}
                            title={review.is_featured ? 'Unfeature' : 'Feature'}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-blue-50 disabled:opacity-40"
                          >
                            {review.is_featured
                              ? <BookmarkCheck size={15} className="text-blue-500" />
                              : <Bookmark size={15} className="text-gray-300" />
                            }
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            disabled={updating[review.id]}
                            onClick={() => updateReview(review.id, { is_approved: !review.is_approved })}
                            title={review.is_approved ? 'Unapprove' : 'Approve'}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-green-50 disabled:opacity-40"
                          >
                            {review.is_approved
                              ? <CheckCircle size={15} className="text-green-500" />
                              : <XCircle size={15} className="text-gray-300" />
                            }
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {new Date(review.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : review.id)}
                              title={isExpanded ? 'Collapse' : 'View Full'}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(review.id)}
                              title="Delete"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-amber-50/40">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <StarRating rating={review.rating} size={18} />
                                  <span className="font-semibold text-gray-700">{review.title || 'Review'}</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{review.content}</p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
                                  <span>By <strong className="text-gray-600">{review.customer_name}</strong></span>
                                  {review.customer_country && <span>· {review.customer_country}</span>}
                                  <span>· {new Date(review.created_at).toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                  Admin Notes
                                </label>
                                <textarea
                                  rows={3}
                                  value={adminNotes[review.id] ?? ''}
                                  onChange={(e) =>
                                    setAdminNotes((p) => ({ ...p, [review.id]: e.target.value }))
                                  }
                                  placeholder="Add private notes about this review…"
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-henna-300 resize-none"
                                />
                                <div className="mt-2 flex gap-2">
                                  <button
                                    onClick={() => saveNotes(review.id)}
                                    disabled={savingNotes[review.id]}
                                    className="px-3 py-1.5 bg-henna-600 text-white text-xs font-medium rounded-lg hover:bg-henna-700 disabled:opacity-50 transition-colors"
                                  >
                                    {savingNotes[review.id] ? 'Saving…' : 'Save Notes'}
                                  </button>
                                  {!review.is_approved && (
                                    <button
                                      onClick={() => updateReview(review.id, { is_approved: true })}
                                      disabled={updating[review.id]}
                                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setConfirmDelete(review.id)}
                                    className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete Review"
        description="This will permanently delete this review. This action cannot be undone."
        confirmLabel="Delete"
        confirmClass="bg-red-600 hover:bg-red-700"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default AdminReviews;
