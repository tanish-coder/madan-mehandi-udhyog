import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useSite, HeroSlide } from '../context/SiteContext';
import type { Product, Review } from '../types/database';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Globe,
  Factory,
  CheckCircle2,
  Star,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Leaf,
  Layers,
  Heart,
} from 'lucide-react';
import Spinner from '../components/ui/Spinner';

export default function Home() {
  const { addToCart } = useCart();
  const { customization, heroSlides } = useSite();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [isPausedReviews, setIsPausedReviews] = useState(false);

  // Dynamic Hero Slides from Admin Customizer (min 4 default slides)
  const defaultFallbackSlides: HeroSlide[] = [
    {
      id: 'slide-1',
      name: '3 Filter Henna Powder',
      slug: '3-filter-henna-powder',
      badge: 'Flagship &bull; Triple-Sifted',
      subtitle: 'Silk-Cloth Filtered for Bridal Cones',
      description: 'Micro-fine cloth filtered specifically for bridal cone paste artists and chemical-free hair dyeing. Zero nozzle clogs, intense dye release within 4–6 hours.',
      price: 299,
      pack_size: '100 gm',
      image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=80',
      tag: 'Zero PPD & Ammonia',
      is_active: true,
    },
    {
      id: 'slide-2',
      name: 'Organic Henna Powder',
      slug: 'organic-henna-powder',
      badge: '100% Certified Organic',
      subtitle: 'Pure Lawsonia Inermis Harvest',
      description: 'Grown naturally in Sojat’s mineral-rich soil without synthetic chemical pesticides. Maximum natural lawsone content for deep scalp cooling and mahogany stains.',
      price: 299,
      pack_size: '100 gm',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      tag: 'Lab Verified Purity',
      is_active: true,
    },
    {
      id: 'slide-3',
      name: 'Indigo Powder',
      slug: 'indigo-powder',
      badge: 'Pure Botanical Hair Dye',
      subtitle: 'Organic Indigofera Tinctoria',
      description: 'Pure shade-dried indigo leaf powder. Used in combination with Sojat henna for natural rich brown to jet-black hair tones without chemical bleach or peroxide.',
      price: 299,
      pack_size: '100 gm',
      image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=1200&q=80',
      tag: 'Rich Natural Black Stain',
      is_active: true,
    },
    {
      id: 'slide-4',
      name: 'Herbal Henna Powder',
      slug: 'herbal-henna-powder',
      badge: '9 Ayurvedic Herbs Infused',
      subtitle: 'Complete Hair & Scalp Therapy',
      description: 'Fortified with Amla, Shikakai, Reetha, Brahmi, Bhringraj, and Neem. Revitalizes hair follicles, arrests premature graying, and delivers silky texture.',
      price: 299,
      pack_size: '100 gm',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80',
      tag: 'Multi-Herbal Formula',
      is_active: true,
    },
  ];

  const activeSlides = (heroSlides && heroSlides.length > 0
    ? heroSlides.filter((s) => s.is_active !== false)
    : []
  );
  const currentSlides = activeSlides.length > 0 ? activeSlides : defaultFallbackSlides;

  // Auto-changing Hero Slider state (loops continuously again and again)
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isPausedSlider, setIsPausedSlider] = useState(false);

  // Auto-slide hero slider every 2.4 seconds continuously unless hovered (faster changing)
  useEffect(() => {
    if (isPausedSlider || currentSlides.length <= 1) return;
    const interval = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % currentSlides.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isPausedSlider, currentSlides.length]);

  // Safeguard index if slides are removed dynamically by admin
  useEffect(() => {
    if (sliderIndex >= currentSlides.length) {
      setSliderIndex(0);
    }
  }, [currentSlides.length, sliderIndex]);

  // Fetch real featured products and approved reviews from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('is_featured', { ascending: false })
            .limit(8),
          supabase
            .from('reviews')
            .select('*')
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .limit(10),
        ]);

        if (prodRes.data) setFeaturedProducts(prodRes.data);
        if (revRes.data) setReviews(revRes.data);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchData();
  }, []);

  // Auto-slide reviews every 4.5 seconds unless hovered
  useEffect(() => {
    if (reviews.length === 0 || isPausedReviews) return;
    const interval = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [reviews.length, isPausedReviews]);

  return (
    <div className="space-y-20 sm:space-y-28 overflow-hidden">
      {/* ── 1. HERO SECTION ── */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] bg-earth-950 text-white flex items-center overflow-hidden">
        {/* Dynamic Admin Background Image - Clearly visible with high fidelity */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: `url(${customization?.hero_bg_image || 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1920&q=80'})`,
          }}
        />

        {/* Soft dark gradient with reduced brown opacity so background photo is properly visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/35 pointer-events-none" />
        <div className="absolute inset-0 bg-henna-950/20 mix-blend-multiply pointer-events-none" />

        {/* Subtle decorative motif */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="henna-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M40 0 C48 20 60 32 80 40 C60 48 48 60 40 80 C32 60 20 48 0 40 C20 32 32 20 40 0 Z" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#henna-pattern)" />
          </svg>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-henna-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-earth-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-henna-200">
                <Sparkles className="w-3.5 h-3.5 text-henna-400" />
                <span>Geographical Indicator of Rajasthan &bull; Sojat Henna</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight text-white">
                {customization?.hero_headline ? (
                  <span>{customization.hero_headline}</span>
                ) : (
                  <>
                    Pure Sojat Henna. <br />
                    <span className="text-gradient from-henna-400 via-amber-300 to-henna-200">
                      Trusted Worldwide.
                    </span>
                  </>
                )}
              </h1>

              <p className="text-earth-200 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {customization?.hero_subheadline ||
                  'Grown in the mineral-rich, arid soil of Sojat City, Rajasthan — celebrated globally for the highest natural lawsonia dye content. We mill 100% pure, triple-cloth-sifted henna and 14 Ayurvedic botanical powders for global retail and wholesale.'}
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-4">
                <Link
                  to="/products"
                  className="btn-primary text-sm px-7 py-3.5 shadow-xl hover:shadow-2xl"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Catalogue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/wholesale"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl border border-white/20 transition-all text-sm backdrop-blur-sm"
                >
                  Wholesale Enquiry
                </Link>

                <Link
                  to="/manufacturing"
                  className="px-6 py-3.5 rounded-xl text-henna-300 hover:text-white font-semibold transition text-sm flex items-center gap-1.5 hover:underline"
                >
                  <span>Start Your Brand</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Badges */}
              <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-white block">
                    ₹299
                  </span>
                  <span className="text-xs text-earth-300">Listed Price / 100 gm</span>
                </div>
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-white block">
                    15
                  </span>
                  <span className="text-xs text-earth-300">Pure Botanical Powders</span>
                </div>
                <div>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-white block">
                    40+
                  </span>
                  <span className="text-xs text-earth-300">Countries Supplied</span>
                </div>
              </div>
            </div>

            {/* Right Visual Card: Auto-Looping Product Slider */}
            <div
              className="lg:col-span-5 flex justify-center"
              onMouseEnter={() => setIsPausedSlider(true)}
              onMouseLeave={() => setIsPausedSlider(false)}
            >
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-tr from-henna-600 to-amber-500 rounded-3xl transform rotate-2 scale-95 opacity-50 blur-lg" />

                <div className="relative bg-earth-900/95 border border-white/15 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-5">
                  {/* Slider Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className="px-3 py-1 rounded-full bg-henna-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs"
                      dangerouslySetInnerHTML={{ __html: currentSlides[sliderIndex]?.badge || 'Premium' }}
                    />
                    <div className="flex items-center gap-1.5 text-xs text-earth-300 font-mono">
                      <span>0{sliderIndex + 1}</span>
                      <span>/</span>
                      <span>0{currentSlides.length}</span>
                    </div>
                  </div>

                  {/* Product Slide Media & Name */}
                  <div className="space-y-4">
                    <div className="relative h-48 rounded-2xl overflow-hidden border border-white/10 group">
                      <img
                        key={currentSlides[sliderIndex]?.id || currentSlides[sliderIndex]?.slug}
                        src={currentSlides[sliderIndex]?.image}
                        alt={currentSlides[sliderIndex]?.name}
                        className="w-full h-full object-cover transition-all duration-700 transform group-hover:scale-105"
                      />
                      <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                        Pack: {currentSlides[sliderIndex]?.pack_size}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-henna-400 uppercase tracking-wider block">
                        {currentSlides[sliderIndex]?.subtitle}
                      </span>
                      <h3 className="font-display text-2xl font-bold text-white mt-0.5">
                        {currentSlides[sliderIndex]?.name}
                      </h3>
                      <p className="text-xs text-earth-300 leading-relaxed mt-1 line-clamp-2">
                        {currentSlides[sliderIndex]?.description}
                      </p>
                    </div>
                  </div>

                  {/* Price & Buy Actions */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-earth-400 block text-[10px] uppercase font-semibold">Standard Pack</span>
                      <span className="font-display font-bold text-white text-lg">
                        ₹{currentSlides[sliderIndex]?.price}.00
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/products/${currentSlides[sliderIndex]?.slug}`}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => {
                          const slide = currentSlides[sliderIndex];
                          if (!slide) return;
                          const matched = featuredProducts.find((p) => p.slug === slide.slug) || {
                            id: slide.id || `slider-${slide.slug}`,
                            name: slide.name,
                            slug: slide.slug,
                            price: slide.price,
                            pack_size: slide.pack_size,
                            is_active: true,
                            is_featured: true,
                            stock_quantity: 100,
                            description: slide.description,
                            short_description: slide.subtitle,
                            category_id: null,
                            tags: null,
                            benefits: null,
                            ingredients: null,
                            usage_instructions: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            primary_image_url: slide.image,
                          };
                          addToCart(matched as any, 1);
                        }}
                        className="btn-primary text-xs px-3.5 py-2 shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>

                  {/* Slider Navigation Dots & Controls */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    {/* Interactive Dots */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {currentSlides.map((p, idx) => (
                        <button
                          key={p.id || p.slug || idx}
                          onClick={() => setSliderIndex(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            idx === sliderIndex
                              ? 'w-7 bg-henna-400'
                              : 'w-2 bg-white/30 hover:bg-white/60'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                          title={p.name}
                        />
                      ))}
                    </div>

                    {/* Prev / Next Arrows */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          setSliderIndex((prev) =>
                            prev === 0 ? currentSlides.length - 1 : prev - 1
                          )
                        }
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                        aria-label="Previous product"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setSliderIndex((prev) => (prev + 1) % currentSlides.length)
                        }
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                        aria-label="Next product"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. SOJAT HERITAGE SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-henna-700">
                <Leaf className="w-4 h-4" />
                <span>Why Sojat is World Famous for Mehndi</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                The Soil, Climate & Heritage of Sojat City
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sojat City in Pali District of Rajasthan possesses a unique arid micro-climate, intense desert sunshine, and alkaline, mineral-dense soil. This rare terroir produces <em>Lawsonia Inermis</em> leaves with the world’s highest natural dye percentage (2.5% to 3.2% lawsone content).
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Generations of Rajasthani farmers and master millers have perfected the timing of leaf harvesting, gentle shade-drying, and precision triple-cloth sifting to yield powder so fine it dissolves effortlessly into a lump-free cone paste.
              </p>
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-sm font-bold text-henna-700 hover:text-henna-800 hover:underline"
                >
                  <span>Read our full Sojat heritage story</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl bg-earth-50 border border-earth-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-henna-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="font-display text-lg font-bold text-gray-900">
                  World's Highest Lawsone
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Laboratory-verified high natural pigment concentration delivering dark, long-lasting reddish-brown to mahogany tones naturally.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-earth-50 border border-earth-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-henna-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="font-display text-lg font-bold text-gray-900">
                  Triple-Cloth Sifted
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Passed through three micro-pore silk filters to eliminate every fiber, grit, or leaf vein — ensuring cones never clog during bridal art.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-earth-50 border border-earth-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-henna-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="font-display text-lg font-bold text-gray-900">
                  Ayurvedic Scalp Therapy
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Ancient cooling properties balance scalp excess heat (Pitta dosha), soothing irritation and naturally conditioning every strand.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-earth-50 border border-earth-100 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-henna-600 text-white flex items-center justify-center font-bold">
                  4
                </div>
                <h4 className="font-display text-lg font-bold text-gray-900">
                  100% Traceable Farm Source
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Direct partnership with certified Sojat farmers guarantees fresh crop yields, zero chemical adulteration, and fair remuneration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURED PRODUCTS CATALOGUE (LIVE SUPABASE DATA) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-henna-700">
              Direct from Sojat Mills
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mt-1">
              Featured Natural Powders
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Uniform transparent pricing: ₹299 per 100 gm on every single listed product
            </p>
          </div>

          <Link
            to="/products"
            className="btn-secondary text-xs inline-flex items-center gap-1.5 self-start md:self-auto"
          >
            <span>View All 15 Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500">Loading products from Supabase...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Visual Header */}
                  <div className="h-48 bg-gradient-to-br from-earth-100 to-henna-50 relative overflow-hidden">
                    {product.primary_image_url ? (
                      <img
                        src={product.primary_image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement;
                          t.style.display = 'none';
                          if (t.nextSibling) (t.nextSibling as HTMLElement).style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ display: product.primary_image_url ? 'none' : 'flex' }}
                    >
                      <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center font-display font-bold text-3xl text-henna-700 group-hover:scale-110 transition-transform duration-300">
                        {product.name.charAt(0)}
                      </div>
                    </div>
                    {product.is_featured && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-henna-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-xs">
                        Featured
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-white/80 backdrop-blur-xs text-[11px] font-semibold text-gray-700">
                      {product.pack_size || '100 gm'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <Link
                      to={`/products/${product.slug}`}
                      className="font-display font-bold text-base text-gray-900 group-hover:text-henna-700 transition block line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {product.short_description || product.description || 'Authentic pure Sojat botanical powder.'}
                    </p>
                  </div>
                </div>

                {/* Footer / Buy Action */}
                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-base font-bold text-gray-900">
                        ₹{Number(product.price).toFixed(2)}
                      </span>
                      {product.original_price && (
                        <span className="text-xs text-gray-400 line-through ml-2">
                          ₹{Number(product.original_price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(product, 1)}
                      className="btn-primary text-xs px-3.5 py-2 shadow-xs"
                      title="Add to cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 4. WHY CHOOSE MMU (THE MMU ADVANTAGE) ── */}
      <section className="bg-earth-50 py-16 sm:py-24 border-y border-earth-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-henna-700">
              The MMU Advantage
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">
              Why Customers &amp; Brands Choose MMU
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We bridge time-tested Rajasthani agricultural mastery with modern hygienic processing, worldwide export logistics, and flexible private-label bottling.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 4 Feature Cards (2x2 Grid) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow border border-gray-100 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-henna-100 text-henna-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900">100% Pure &amp; Lab Tested</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Zero chemical additives, zero heavy metals, zero synthetic colors, and zero PPD. Certified pure plant powder.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow border border-gray-100 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-henna-100 text-henna-700 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900">Triple-Sifted Filter</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Ultra-smooth micro-mesh cloth filtration guarantees an effortless, clog-free cone application for bridal artists.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow border border-gray-100 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-henna-100 text-henna-700 flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900">Worldwide Wholesale</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Reliable ocean and air cargo export directly from Sojat to over 40 countries on CIF and FOB incoterms.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow border border-gray-100 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-henna-100 text-henna-700 flex items-center justify-center">
                  <Factory className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-900">Private Label Contract</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Launch your own cosmetics or hair care brand with MMU third-party manufacturing and custom foil packaging.
                </p>
              </div>
            </div>

            {/* Right Photo: Editable by Admin in Admin Panel */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md group">
                <div className="absolute -inset-2 bg-gradient-to-tr from-henna-500 to-amber-500 rounded-3xl blur-md opacity-25 group-hover:opacity-40 transition duration-500" />
                <div className="relative rounded-3xl overflow-hidden border border-earth-200 shadow-xl bg-white aspect-[4/3] sm:aspect-square">
                  <img
                    src={customization?.advantage_image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'}
                    alt="The MMU Advantage - Sojat Quality"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-henna-600/90 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm mb-1.5 backdrop-blur-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sojat Quality Verified
                    </span>
                    <h4 className="font-display text-lg font-bold text-white leading-tight">
                      Rajasthan's Premier Henna Hub
                    </h4>
                    <p className="text-xs text-earth-200 mt-0.5 line-clamp-2">
                      Direct factory milling ensuring uniform green color, zero synthetic adulterants, and rich dye intensity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. PRIVATE LABEL & MANUFACTURING SPOTLIGHT (PHOTO ON RIGHT) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-henna-900 via-earth-900 to-henna-950 rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Column: Text Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-henna-200">
                <Factory className="w-4 h-4 text-henna-400" />
                <span>Third-Party &amp; Contract Manufacturing</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Start Your Own Natural Product Brand with MMU.
              </h2>

              <p className="text-earth-200 text-sm sm:text-base leading-relaxed">
                We empower beauty entrepreneurs, salon chains, and wellness companies worldwide by formulating, testing, filling, and packaging premium Sojat henna and Ayurvedic powders under your own brand identity.
              </p>

              {/* 5-Step Process */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <span className="font-bold text-henna-400 block mb-1">01. Share Brief</span>
                  <span className="text-earth-300">Product vision &amp; quantities</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <span className="font-bold text-henna-400 block mb-1">02. Select Herbs</span>
                  <span className="text-earth-300">Choose from 15 powders</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <span className="font-bold text-henna-400 block mb-1">03. Packaging</span>
                  <span className="text-earth-300">Custom foil, pouch or cone</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <span className="font-bold text-henna-400 block mb-1">04. Lab Testing</span>
                  <span className="text-earth-300">COA &amp; export clearance</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs col-span-2 sm:col-span-1">
                  <span className="font-bold text-henna-400 block mb-1">05. Production</span>
                  <span className="text-earth-300">Global dispatch</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  to="/manufacturing"
                  className="btn-primary text-xs px-6 py-3 shadow-lg hover:shadow-xl"
                >
                  <span>Submit Private Label Enquiry</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/wholesale"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 transition-all text-xs"
                >
                  Wholesale Volume Discounts
                </Link>
              </div>
            </div>

            {/* Right Column: Photo (after the text then photo) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md group">
                <div className="absolute -inset-2 bg-gradient-to-tr from-henna-500 to-amber-500 rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition duration-500" />
                <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-earth-950 aspect-[4/3] sm:aspect-square">
                  <img
                    src={customization?.manufacturing_image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80'}
                    alt="MMU Contract &amp; Private Label Manufacturing"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-5 left-5 right-5 p-3.5 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 text-white">
                    <span className="text-[10px] font-bold text-henna-400 uppercase tracking-wider block">
                      Custom Packaging &amp; Labeling
                    </span>
                    <p className="text-xs font-medium text-earth-100 mt-0.5">
                      Standup foil pouches, custom canisters &amp; salon bulk packaging.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. CONTINUOUS ANIMATED CUSTOMER REVIEWS (LEFT TO RIGHT) ── */}
      <section className="py-6 space-y-8 overflow-hidden">
        <div className="text-center max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-henna-700">
            Real Customer Voices
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">
            Genuine Reviews from Around the World
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Continuously sliding customer feedback &bull; Hover to pause
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="relative w-full overflow-hidden py-4">
            {/* Edge fade gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

            {/* Continuous Marquee Track (Left to Right) */}
            <div className="animate-marquee-ltr flex items-center gap-6">
              {[...reviews, ...reviews, ...reviews].map((rev, idx) => (
                <div
                  key={`${rev.id}-${idx}`}
                  className="w-80 sm:w-96 flex-shrink-0 bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    </div>

                    {rev.title && (
                      <h4 className="font-display text-base font-bold text-gray-900 leading-snug line-clamp-1">
                        "{rev.title}"
                      </h4>
                    )}

                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed italic line-clamp-3">
                      "{rev.content}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-henna-600 to-henna-900 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                      {(rev.customer_name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-gray-900 text-xs truncate">
                        {rev.customer_name}
                      </h5>
                      <span className="text-[11px] text-gray-400 block truncate">
                        {rev.customer_country || 'India'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-gray-400">
            Customer reviews loading from Supabase...
          </div>
        )}

        <div className="text-center pt-2">
          <Link
            to="/reviews"
            className="text-xs font-bold text-henna-700 hover:underline inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-henna-50 hover:bg-henna-100 transition"
          >
            <span>Read All Verified Reviews or Share Your Feedback</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── 7. GOOGLE RATING & MAP SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Details */}
          <div className="lg:col-span-5 p-8 sm:p-12 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-henna-700">
                <MapPin className="w-4 h-4" />
                <span>Visit Our Manufacturing Facility</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                Industrial Area, 3rd Phase, Sojat City, Rajasthan
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                We welcome domestic bulk buyers, salon distributors, and international export delegations to visit our modern processing mills in Sojat City.
              </p>
            </div>

            {/* Google Reviews Banner */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-amber-900 text-xs">4.9 / 5.0 Rating</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Rated as Sojat’s premier authentic henna powder wholesale manufacturer.
              </p>
              <a
                href="https://maps.google.com/?q=Sojat+City+Rajasthan"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-henna-800 hover:underline pt-1"
              >
                <span>Read Google Reviews</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=Sojat+City+Rajasthan"
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-xs w-full justify-center py-3"
              >
                <MapPin className="w-4 h-4" />
                <span>Get Driving Directions to Factory</span>
              </a>
            </div>
          </div>

          {/* Right Map Embed */}
          <div className="lg:col-span-7 min-h-[350px] lg:min-h-full bg-gray-100">
            <iframe
              title="Madan Mehandi Udhyog Factory Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57500!2d73.66!3d25.92!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x394200c5c8e3cf3b%3A0xb35a7be3c41!2sSojat%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '380px' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* ── 8. NEWSLETTER & BULK ENQUIRY BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-earth-100 rounded-3xl p-8 sm:p-12 border border-earth-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left space-y-2">
            <h3 className="font-display text-2xl font-bold text-gray-900">
              Need a Custom Bulk Henna Quotation?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Speak directly with our export team for metric ton pricing, container scheduling, or certificate of analysis (COA) requests.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/enquiry"
              className="btn-primary text-xs px-6 py-3 w-full sm:w-auto text-center"
            >
              Submit Requirements
            </Link>
            <a
              href="https://wa.me/917976705440?text=Hello%20MMU,%20I%20would%20like%20to%20chat%20about%20a%20bulk%20quote%20for%20Sojat%20Henna."
              target="_blank"
              rel="noreferrer"
              className="btn-secondary text-xs px-5 py-3 w-full sm:w-auto text-center"
            >
              Chat with Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
