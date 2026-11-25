import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Review } from '../types/database';
import toast from 'react-hot-toast';
import {
  Star,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Send,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Plus,
  Quote,
  Globe,
  X,
} from 'lucide-react';
import Spinner from '../components/ui/Spinner';

/* ─── Types ─── */
interface Product { id: string; name: string; }

/* ─── Star renderer ─── */
function Stars({ rating, size = 4 }: { rating: number; size?: number }) {
  const sz = size === 3 ? 'w-3.5 h-3.5' : size === 5 ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sz} ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  );
}

/* ─── Country flag helper ─── */
function countryInitials(country: string) {
  return country.slice(0, 2).toUpperCase();
}

export default function Reviews() {
  const { user } = useAuth();

  /* ─── State ─── */
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');

  /* ─── Carousel ─── */
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [carouselDragging, setCarouselDragging] = useState(false);
  const dragStartX = useRef(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  /* ─── Review modal ─── */
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    customer_name: '',
    customer_country: '',
    product_id: '',
    rating: 5,
    title: '',
    content: '',
  });

  /* ─── Fetch ─── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [revRes, prodRes] = await Promise.all([
        supabase
          .from('reviews')
          .select('*')
          .eq('is_approved', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase.from('products').select('id, name').eq('is_active', true).order('name'),
      ]);
      if (revRes.data) setReviews(revRes.data);
      if (prodRes.data) setProducts(prodRes.data);
    } catch (err) {
      console.error('Reviews fetch error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ─── Auto-slide carousel ─── */
  const featuredReviews = reviews.filter((r) => r.is_featured || r.rating === 5).slice(0, 8);
  const carouselReviews = featuredReviews.length >= 3 ? featuredReviews : reviews.slice(0, 8);

  useEffect(() => {
    if (isCarouselPaused || carouselReviews.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % carouselReviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isCarouselPaused, carouselReviews.length]);

  const goNext = () => setCarouselIdx((prev) => (prev + 1) % carouselReviews.length);
  const goPrev = () => setCarouselIdx((prev) => (prev === 0 ? carouselReviews.length - 1 : prev - 1));

  /* ─── Touch / drag on carousel ─── */
  const onDragStart = (clientX: number) => { dragStartX.current = clientX; setCarouselDragging(true); };
  const onDragEnd = (clientX: number) => {
    if (!carouselDragging) return;
    const diff = dragStartX.current - clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
    setCarouselDragging(false);
  };

  /* ─── Filtered grid ─── */
  const filteredReviews = reviews.filter((r) => starFilter === 'all' || r.rating === starFilter);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const ratingCounts = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  /* ─── Submit ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewForm.content.trim().length < 10) {
      toast.error('Please write at least 10 characters in your review.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        customer_name: reviewForm.customer_name.trim(),
        customer_country: reviewForm.customer_country.trim() || 'India',
        product_id: reviewForm.product_id || null,
        rating: reviewForm.rating,
        title: reviewForm.title.trim() || null,
        content: reviewForm.content.trim(),
        is_approved: false,
        is_featured: false,
      };
      // attach user_id only if logged in (RLS allows it)
      if (user) payload.user_id = user.id;

      const { error } = await supabase.from('reviews').insert(payload);
      if (error) throw error;

      toast.success('Review submitted! It will appear after admin approval.');
      setShowModal(false);
      setReviewForm({ customer_name: '', customer_country: '', product_id: '', rating: 5, title: '', content: '' });
    } catch (err: any) {
      toast.error('Failed to submit: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 py-24">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Loading reviews…</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">

      {/* ══ 1. HEADER ══ */}
      <section className="bg-gradient-to-br from-henna-950 via-earth-900 to-henna-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            {/* Left copy */}
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-henna-200 backdrop-blur-sm">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Genuine Customer Testimonials — Admin Moderated</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                What Our Customers<br />
                <span className="text-gradient from-amber-300 to-henna-300">Are Saying</span>
              </h1>
              <p className="text-earth-200 text-sm leading-relaxed">
                Real feedback from bridal artists, salons, Ayurvedic practitioners, and retail customers worldwide who trust MMU Sojat henna.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary text-sm px-6 py-3 shadow-lg inline-flex"
              >
                <Plus className="w-4 h-4" />
                Write a Review
              </button>
            </div>

            {/* Right: Rating card + bar chart */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-4 items-center md:items-end flex-shrink-0 w-full md:w-auto">
              {/* Big score */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 text-center min-w-[140px]">
                <span className="font-display text-5xl font-bold text-amber-300 block">{averageRating}</span>
                <Stars rating={Math.round(parseFloat(averageRating))} size={4} />
                <span className="text-[11px] text-earth-300 mt-1 block">{reviews.length} verified reviews</span>
              </div>

              {/* Bar chart */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 space-y-2 w-full sm:w-56 md:w-52">
                {ratingCounts.map(({ stars, count }) => {
                  const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2 text-[11px]">
                      <span className="text-earth-300 w-3 text-right font-mono">{stars}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                      <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-earth-400 w-7 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 2. AUTO-SLIDING CAROUSEL ══ */}
      {carouselReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-henna-700">Featured Reviews</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5">
                Trusted by Customers Worldwide
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-henna-50 hover:border-henna-200 text-gray-600 hover:text-henna-700 transition shadow-xs"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-henna-50 hover:border-henna-200 text-gray-600 hover:text-henna-700 transition shadow-xs"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Carousel track — shows 1 on mobile, 2 on md, 3 on lg */}
          <div
            ref={carouselRef}
            className="relative overflow-hidden rounded-3xl cursor-grab active:cursor-grabbing select-none"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
            onMouseDown={(e) => onDragStart(e.clientX)}
            onMouseUp={(e) => onDragEnd(e.clientX)}
            onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
            onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${carouselIdx * 100}%)` }}
            >
              {carouselReviews.map((review, idx) => (
                <div key={review.id} className="w-full flex-shrink-0 px-1">
                  <div className="bg-gradient-to-br from-white to-earth-50 rounded-3xl border border-earth-100 shadow-md p-6 sm:p-8 flex flex-col gap-5">
                    {/* Top */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-henna-600 to-henna-900 text-white flex items-center justify-center font-display font-bold text-xl shadow-md flex-shrink-0">
                          {review.customer_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{review.customer_name}</p>
                          <p className="text-xs text-gray-500">{review.customer_country || 'India'}</p>
                        </div>
                      </div>
                      <Quote className="w-8 h-8 text-henna-200 flex-shrink-0 mt-1" />
                    </div>

                    {/* Stars */}
                    <Stars rating={review.rating} size={4} />

                    {/* Title */}
                    {review.title && (
                      <h3 className="font-display font-bold text-lg text-gray-900 leading-snug">
                        "{review.title}"
                      </h3>
                    )}

                    {/* Content */}
                    <p className="text-gray-600 text-sm leading-relaxed flex-1 italic">
                      "{review.content}"
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-earth-100">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Review
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {carouselReviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCarouselIdx(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === carouselIdx ? 'w-7 h-2 bg-henna-600' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to review ${idx + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* ══ 3. FILTER + GRID ══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Filter:</span>
            <button
              onClick={() => setStarFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                starFilter === 'all' ? 'bg-henna-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                onClick={() => setStarFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  starFilter === s ? 'bg-henna-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s}<Star className="w-3 h-3 fill-current text-amber-400" />
                <span className="text-[10px] opacity-70">({reviews.filter(r => r.rating === s).length})</span>
              </button>
            ))}
          </div>
          <a
            href="https://maps.google.com/?q=Madan+Mehandi+Udhyog+Sojat+City+Rajasthan"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-henna-700 hover:underline inline-flex items-center gap-1 flex-shrink-0"
          >
            <Globe className="w-3.5 h-3.5" />
            Google Business Profile
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Grid */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 space-y-3">
            <MessageSquare className="w-12 h-12 text-gray-200 mx-auto" />
            <h3 className="font-display text-lg font-bold text-gray-700">No reviews yet</h3>
            <p className="text-xs text-gray-400">Be the first to share your experience with MMU!</p>
            <button onClick={() => setShowModal(true)} className="btn-primary text-xs mt-2 mx-auto">
              Submit First Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <Stars rating={review.rating} size={3} />
                    <span className="text-[11px] text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {review.title && (
                    <h4 className="font-display font-bold text-sm text-gray-900 leading-snug group-hover:text-henna-700 transition">
                      "{review.title}"
                    </h4>
                  )}

                  <p className="text-xs text-gray-600 leading-relaxed italic line-clamp-4">
                    "{review.content}"
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-henna-600 to-henna-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {review.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-gray-900 text-xs block truncate">{review.customer_name}</span>
                      <span className="text-[11px] text-gray-400 truncate block">{review.customer_country || 'India'}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══ 4. WRITE REVIEW MODAL ══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[95vh] overflow-y-auto animate-slide-in">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900">Share Your Experience</h3>
                <p className="text-xs text-gray-500 mt-0.5">Reviews go live after admin approval</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Star rating picker */}
              <div>
                <label className="label">Your Rating <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= (hoverRating || reviewForm.rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200 fill-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-2">
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hoverRating || reviewForm.rating]}
                  </span>
                </div>
              </div>

              {/* Name + Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Your Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={reviewForm.customer_name}
                    onChange={(e) => setReviewForm((p) => ({ ...p, customer_name: e.target.value }))}
                    placeholder="e.g. Priya Sharma"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Country / City</label>
                  <input
                    type="text"
                    value={reviewForm.customer_country}
                    onChange={(e) => setReviewForm((p) => ({ ...p, customer_country: e.target.value }))}
                    placeholder="e.g. India, Mumbai"
                    className="input"
                  />
                </div>
              </div>

              {/* Product */}
              <div>
                <label className="label">Which MMU Product?</label>
                <select
                  value={reviewForm.product_id}
                  onChange={(e) => setReviewForm((p) => ({ ...p, product_id: e.target.value }))}
                  className="input"
                >
                  <option value="">General / Multiple Products</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="label">Review Headline</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Best bridal cone henna I've used!"
                  className="input"
                />
              </div>

              {/* Content */}
              <div>
                <label className="label">Your Review <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Describe dye release, texture, colour payoff, hair conditioning results…"
                  className="input resize-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">{reviewForm.content.length} characters (min 10)</p>
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <strong>Note:</strong> Your review will be visible after verification by the MMU admin team. No fake or incentivised reviews are published.
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary text-xs">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{submitting ? 'Submitting…' : 'Submit Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
