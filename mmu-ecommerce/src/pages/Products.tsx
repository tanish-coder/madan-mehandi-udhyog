import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import type { Product, Category } from '../types/database';
import {
  Search,
  Filter,
  ShoppingBag,
  Sparkles,
  ArrowUpDown,
  Tag,
  CheckCircle2,
  Package,
} from 'lucide-react';
import Spinner from '../components/ui/Spinner';

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          supabase.from('products').select('*').eq('is_active', true),
          supabase.from('categories').select('*').order('name'),
        ]);

        if (prodRes.data) setProducts(prodRes.data);
        if (catRes.data) setCategories(catRes.data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) ||
      (p.short_description && p.short_description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || p.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'featured') return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-henna-950 via-earth-900 to-henna-900 rounded-3xl p-8 sm:p-12 text-white shadow-lg space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-henna-200">
          <Sparkles className="w-3.5 h-3.5 text-henna-400" />
          <span>Sojat Farm-to-Mill Botanical Catalogue</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
          Natural Henna & Ayurvedic Powders
        </h1>
        <p className="text-earth-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Explore our complete range of 15 authentic Rajasthani botanical powders. All products are micro-fine sifted, 100% natural, and uniformly priced at ₹299 per 100 gm.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedCategory === 'all'
                  ? 'bg-henna-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Powders ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedCategory === c.id
                    ? 'bg-henna-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs text-gray-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-henna-500 bg-white"
            >
              <option value="featured">Featured First</option>
              <option value="name">Name (A–Z)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by powder name (e.g., Henna, Indigo, Moringa, Rose, Amla)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-henna-500"
          />
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Loading products from Supabase...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 space-y-3">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-display text-lg font-bold text-gray-800">No matching powders found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search keyword or clearing the category filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
            }}
            className="btn-secondary text-xs px-4 py-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Visual Header */}
                <div className="h-52 bg-gradient-to-br from-earth-100 via-henna-50/40 to-earth-100 relative overflow-hidden">
                  {product.primary_image_url ? (
                    <img
                      src={product.primary_image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-6">
                      <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center font-display font-bold text-4xl text-henna-700 group-hover:scale-110 transition-transform duration-300">
                        {product.name.charAt(0)}
                      </div>
                    </div>
                  )}
                  {product.is_featured && (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-henna-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-xs">
                      Featured
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded bg-white/80 backdrop-blur-xs text-[11px] font-semibold text-gray-700">
                    {product.pack_size || '100 gm'}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-2">
                  <span className="inline-block text-[11px] font-semibold text-henna-700 uppercase tracking-wider">
                    {categoryMap.get(product.category_id || '') || 'Ayurvedic Powder'}
                  </span>
                  <Link
                    to={`/products/${product.slug}`}
                    className="font-display font-bold text-lg text-gray-900 group-hover:text-henna-700 transition block line-clamp-1"
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
                    <span className="text-lg font-bold text-gray-900">
                      ₹{Number(product.price).toFixed(2)}
                    </span>
                    {product.original_price && (
                      <span className="text-xs text-gray-400 line-through ml-2">
                        ₹{Number(product.original_price).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/products/${product.slug}`}
                      className="p-2 rounded-xl text-gray-500 hover:text-henna-700 hover:bg-henna-50 border border-gray-200 transition text-xs font-semibold"
                      title="View Details"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="btn-primary text-xs px-3.5 py-2 shadow-xs"
                      title="Add to cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
