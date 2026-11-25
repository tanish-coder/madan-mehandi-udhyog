import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import type { Product, Category, Review } from '../types/database';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ShoppingBag,
  Heart,
  Share2,
  ShieldCheck,
  Award,
  Sparkles,
  Truck,
  CheckCircle2,
  Star,
  Plus,
  Minus,
  Layers,
  Leaf,
  Calendar,
} from 'lucide-react';
import Spinner from '../components/ui/Spinner';

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'ingredients' | 'usage' | 'reviews'>('benefits');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (prodErr) throw prodErr;
        setProduct(prodData);

        if (prodData?.category_id) {
          const { data: catData } = await supabase
            .from('categories')
            .select('*')
            .eq('id', prodData.category_id)
            .single();
          if (catData) setCategory(catData);
        }

        // Fetch product images from product_images table
        const { data: imgData } = await supabase
          .from('product_images')
          .select('url')
          .eq('product_id', prodData.id)
          .order('display_order');
        if (imgData && imgData.length > 0) {
          setGalleryImages(imgData.map((i: any) => i.url));
        } else if (prodData.primary_image_url) {
          setGalleryImages([prodData.primary_image_url]);
        }
        setActiveImageIdx(0);

        // Fetch related products
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .neq('slug', slug)
          .eq('is_active', true)
          .limit(4);

        if (relatedData) setRelatedProducts(relatedData);

        // Fetch product reviews
        const { data: revData } = await supabase
          .from('reviews')
          .select('*')
          .eq('is_approved', true)
          .limit(5);

        if (revData) setReviews(revData);
      } catch (err: any) {
        console.error('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Loading Sojat botanical details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-gray-100 text-center space-y-4 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-gray-900">Product Not Found</h2>
        <p className="text-xs text-gray-500">The requested natural powder does not exist or has been relocated.</p>
        <Link to="/products" className="btn-primary text-xs">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-henna-700">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-henna-700">Products</Link>
        <span>/</span>
        {category && (
          <>
            <span className="text-gray-400">{category.name}</span>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-semibold">{product.name}</span>
      </div>

      {/* Main Product Showcase Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Media Column */}
          <div className="lg:col-span-5 space-y-4">
            {/* Main Image */}
            <div className="h-96 sm:h-[420px] rounded-2xl bg-gradient-to-br from-earth-100 via-henna-50/50 to-earth-100 relative overflow-hidden border border-earth-100">
              {galleryImages.length > 0 ? (
                <img
                  src={galleryImages[activeImageIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full bg-white shadow-md flex items-center justify-center font-display font-bold text-6xl text-henna-700">
                    {product.name.charAt(0)}
                  </div>
                </div>
              )}
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-henna-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs">
                Pure Sojat Harvest
              </span>
              <span className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-white/90 backdrop-blur-xs text-xs font-bold text-gray-800 shadow-xs">
                Pack: {product.pack_size || '100 gm'}
              </span>
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                      idx === activeImageIdx ? 'border-henna-600 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quality Guarantee Mini Badges */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-gray-600 pt-2">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-henna-600 mx-auto mb-1" />
                <span className="font-semibold block">100% Pure</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <Award className="w-4 h-4 text-henna-600 mx-auto mb-1" />
                <span className="font-semibold block">Triple-Sifted</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <Truck className="w-4 h-4 text-henna-600 mx-auto mb-1" />
                <span className="font-semibold block">Fresh Dispatch</span>
              </div>
            </div>
          </div>

          {/* Right Product Buy Options */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-henna-700 block mb-1">
                {category?.name || 'Ayurvedic Botanical'}
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-gray-400 font-mono mt-0.5">SKU: MMU-SOJ-{product.slug.toUpperCase()}</p>
            </div>

            {/* Price block */}
            <div className="p-5 rounded-2xl bg-earth-50/70 border border-earth-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block">Retail Price (Inclusive of all taxes)</span>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="font-display text-3xl font-bold text-gray-900">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                  {product.original_price && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{Number(product.original_price).toFixed(2)}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    In Stock
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-400 block">Standard Pack Size</span>
                <span className="font-bold text-gray-800 text-sm">{product.pack_size || '100 gm'}</span>
              </div>
            </div>

            {/* Short Excerpt */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.short_description || product.description}
            </p>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-gray-500 hover:text-henna-700 hover:bg-gray-50 rounded-l-xl transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-bold text-sm text-gray-900 min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-gray-500 hover:text-henna-700 hover:bg-gray-50 rounded-r-xl transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xs text-gray-500">
                  Total: <strong>₹{(Number(product.price) * quantity).toFixed(2)}</strong>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="btn-primary flex-1 justify-center py-3.5 text-sm shadow-md hover:shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="bg-earth-900 hover:bg-earth-950 text-white font-semibold px-6 py-3.5 rounded-xl transition text-sm flex-1 text-center shadow-md"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* B2B Wholesale link */}
            <div className="p-4 rounded-xl border border-dashed border-henna-200 bg-henna-50/50 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-henna-900 block">Looking for 25kg+ Bulk Wholesale or Private Label?</span>
                <span className="text-henna-700">Special metric-ton export pricing and custom branding available.</span>
              </div>
              <Link to="/wholesale" className="btn-secondary text-xs px-3 py-1.5 flex-shrink-0">
                Bulk Quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs (Benefits, Ingredients, Usage, Reviews) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-8">
        <div className="flex border-b border-gray-100 gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('benefits')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeTab === 'benefits'
                ? 'border-henna-600 text-henna-700'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Benefits</span>
          </button>

          <button
            onClick={() => setActiveTab('ingredients')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeTab === 'ingredients'
                ? 'border-henna-600 text-henna-700'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span>Ingredients</span>
          </button>

          <button
            onClick={() => setActiveTab('usage')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeTab === 'usage'
                ? 'border-henna-600 text-henna-700'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>How to Use / Recipe</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-henna-600 text-henna-700'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Customer Reviews</span>
          </button>
        </div>

        {/* Tab 1: Benefits */}
        {activeTab === 'benefits' && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-gray-900">
              Key Botanical & Ayurvedic Benefits
            </h3>
            {product.benefits && product.benefits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-henna-600 flex-shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                100% pure herbal formulation harvested and packaged under hygienic manufacturing standards.
              </p>
            )}
          </div>
        )}

        {/* Tab 2: Ingredients */}
        {activeTab === 'ingredients' && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-gray-900">
              Botanical Ingredients Composition
            </h3>
            {product.ingredients && product.ingredients.length > 0 ? (
              <div className="space-y-2">
                {product.ingredients.map((ing, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-earth-50 border border-earth-100 text-xs font-semibold text-gray-800">
                    &bull; {ing}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">100% Pure single-source botanical leaf/root powder.</p>
            )}
            <p className="text-[11px] text-gray-400 pt-2">
              Free from artificial preservatives, fragrance oils, parabens, SLS, or synthetic color enhancers.
            </p>
          </div>
        )}

        {/* Tab 3: Usage Instructions */}
        {activeTab === 'usage' && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-gray-900">
              Recommended Application & Guide
            </h3>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {product.usage_instructions ||
                'Mix desired quantity with lukewarm water into a smooth paste. Rest for recommended dye-release window or apply immediately according to formulation needs. Rinse with clean water.'}
            </div>
          </div>
        )}

        {/* Tab 4: Customer Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-gray-900">
                Verified Feedback
              </h3>
              <Link to="/reviews" className="btn-secondary text-xs px-3 py-1.5">
                Write a Review
              </Link>
            </div>

            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900">{r.customer_name}</span>
                    <div className="flex text-amber-400">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  {r.title && <h5 className="font-semibold text-xs text-gray-800">"{r.title}"</h5>}
                  <p className="text-xs text-gray-600 leading-relaxed">"{r.content}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-gray-900">
              Other Pure Sojat Powders
            </h2>
            <Link to="/products" className="text-xs font-bold text-henna-700 hover:underline">
              View All 15 Powders &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 rounded-xl bg-earth-50 overflow-hidden flex items-center justify-center mb-3 group">
                    {rel.primary_image_url ? (
                      <img
                        src={rel.primary_image_url}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <span className="font-display font-bold text-3xl text-henna-700">
                        {rel.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/products/${rel.slug}`}
                    className="font-display font-bold text-sm text-gray-900 hover:text-henna-700 line-clamp-1 block"
                  >
                    {rel.name}
                  </Link>
                  <p className="text-[11px] text-gray-400 mt-0.5">{rel.pack_size || '100 gm'}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                  <span className="font-bold text-sm text-gray-900">₹{Number(rel.price).toFixed(2)}</span>
                  <Link to={`/products/${rel.slug}`} className="btn-secondary text-[11px] px-2.5 py-1">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
