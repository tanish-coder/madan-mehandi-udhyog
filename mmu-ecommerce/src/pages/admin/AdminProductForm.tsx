import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { uploadMedia } from '../../lib/r2';
import type { Category } from '../../types/database';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Save,
  Package,
  Sparkles,
  Layers,
  HelpCircle,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  UploadCloud,
  Film,
  Image as ImageIcon,
  X,
  FileCheck,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    price: '299.00',
    original_price: '399.00',
    pack_size: '100 gm',
    stock_quantity: '100',
    is_active: true,
    is_featured: false,
    short_description: '',
    description: '',
    tags: '',
    benefits: '',
    ingredients: '',
    usage_instructions: '',
    primary_image_url: '',
  });

  // Fetch categories & existing product if in edit mode
  useEffect(() => {
    const init = async () => {
      try {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (catError) throw catError;
        setCategories(catData || []);

        if (isEditMode && id) {
          const { data: prodData, error: prodError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

          if (prodError) throw prodError;
          if (prodData) {
            setFormData({
              name: prodData.name || '',
              slug: prodData.slug || '',
              category_id: prodData.category_id || '',
              price: prodData.price ? String(prodData.price) : '299.00',
              original_price: prodData.original_price ? String(prodData.original_price) : '',
              pack_size: prodData.pack_size || '100 gm',
              stock_quantity: String(prodData.stock_quantity ?? 100),
              is_active: prodData.is_active ?? true,
              is_featured: prodData.is_featured ?? false,
              short_description: prodData.short_description || '',
              description: prodData.description || '',
              tags: prodData.tags ? prodData.tags.join(', ') : '',
              benefits: prodData.benefits ? prodData.benefits.join('\n') : '',
              ingredients: prodData.ingredients ? prodData.ingredients.join('\n') : '',
              usage_instructions: prodData.usage_instructions || '',
              primary_image_url: prodData.primary_image_url || '',
            });
          }
        }
      } catch (err: any) {
        toast.error('Failed to load product details: ' + err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, [id, isEditMode]);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaInfo, setMediaInfo] = useState<{
    provider: string;
    objectKey: string;
    fileName: string;
    size: number;
    type: string;
  } | null>(null);

  // Handle name change and auto-slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: !isEditMode
        ? newName
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
        : prev.slug,
    }));
  };

  // Upload file to Cloudflare R2 / Storage Bucket
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
    if (!isValidType) {
      toast.error('Please upload an image (PNG, JPG, WEBP) or video (MP4, WEBM)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50MB');
      return;
    }

    setUploading(true);
    setUploadProgress(15);

    try {
      const result = await uploadMedia(file, 'products', (pct) => setUploadProgress(pct));
      setFormData((prev) => ({ ...prev, primary_image_url: result.url }));
      setMediaInfo({
        provider: result.provider === 'cloudflare-r2' ? 'Cloudflare R2 Bucket' : 'Storage Bucket (mmu-media)',
        objectKey: result.objectKey,
        fileName: result.fileName,
        size: result.size,
        type: result.type,
      });
      toast.success(`Media uploaded to ${result.provider === 'cloudflare-r2' ? 'Cloudflare R2' : 'Storage Bucket'} successfully!`);
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('Product slug is required');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Valid price is required');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        category_id: formData.category_id || null,
        price: priceNum,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        pack_size: formData.pack_size.trim() || '100 gm',
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        short_description: formData.short_description.trim() || null,
        description: formData.description.trim() || null,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        benefits: formData.benefits
          ? formData.benefits.split('\n').map((b) => b.trim()).filter(Boolean)
          : [],
        ingredients: formData.ingredients
          ? formData.ingredients.split('\n').map((i) => i.trim()).filter(Boolean)
          : [],
        usage_instructions: formData.usage_instructions.trim() || null,
        primary_image_url: formData.primary_image_url.trim() || null,
        updated_at: new Date().toISOString(),
      };

      let savedProductId = id;

      if (isEditMode && id) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
        toast.success('Product updated successfully!');
      } else {
        payload.created_at = new Date().toISOString();
        const { data: newProd, error } = await supabase
          .from('products')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        savedProductId = newProd.id;
        toast.success('New product created successfully!');
      }

      // Sync image to product_images table if uploaded
      if (payload.primary_image_url && savedProductId) {
        await supabase.from('product_images').insert({
          product_id: savedProductId,
          url: payload.primary_image_url,
          alt_text: `${payload.name} - Product Media`,
          is_primary: true,
          display_order: 1,
        });
      }

      navigate('/admin/products');
    } catch (err: any) {
      toast.error('Failed to save product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Loading product configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">
              {isEditMode ? `Edit Product: ${formData.name || 'Untitled'}` : 'Add New Product'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure product details, pack specifications and botanical properties
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary inline-flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isEditMode ? 'Update Product' : 'Save Product'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Product Information Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
          <h2 className="font-display text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-henna-600" />
            General Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. 3 Filter Henna Powder"
                className="input"
              />
            </div>

            <div>
              <label className="label">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="text-gray-400 text-xs px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg font-mono">
                  /products/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))
                  }
                  placeholder="e.g. 3-filter-henna-powder"
                  className="input rounded-l-none font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category_id: e.target.value }))
                }
                className="input"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="sojat, henna, natural, cone powder"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Short Description (Summary)</label>
            <textarea
              rows={2}
              value={formData.short_description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, short_description: e.target.value }))
              }
              placeholder="A brief punchy summary for product cards..."
              className="input"
            />
          </div>

          <div>
            <label className="label">Full Detailed Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Detailed explanation of origins, texture, botanical benefits and purity..."
              className="input"
            />
          </div>
        </div>

        {/* Pricing, Packaging and Inventory Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
          <h2 className="font-display text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-henna-600" />
            Pricing, Packaging & Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="label">
                Current Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="299.00"
                  className="input pl-8"
                />
              </div>
            </div>

            <div>
              <label className="label">Original Price (₹ - Optional Strikethrough)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, original_price: e.target.value }))
                  }
                  placeholder="399.00"
                  className="input pl-8"
                />
              </div>
            </div>

            <div>
              <label className="label">Pack Size</label>
              <input
                type="text"
                value={formData.pack_size}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, pack_size: e.target.value }))
                }
                placeholder="100 gm"
                className="input"
              />
            </div>

            <div>
              <label className="label">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, stock_quantity: e.target.value }))
                }
                placeholder="100"
                className="input"
              />
            </div>
          </div>

          {/* Visibility and Flags */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                }
                className="w-5 h-5 rounded border-gray-300 text-henna-600 focus:ring-henna-500"
              />
              <div>
                <span className="text-sm font-semibold text-gray-900 block">Active Status</span>
                <span className="text-xs text-gray-500">Visible for retail and wholesale customers</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))
                }
                className="w-5 h-5 rounded border-gray-300 text-henna-600 focus:ring-henna-500"
              />
              <div>
                <span className="text-sm font-semibold text-gray-900 block">Featured on Homepage</span>
                <span className="text-xs text-gray-500">Highlighted in the flagship showcase carousel</span>
              </div>
            </label>
          </div>
        </div>

        {/* Botanical Ingredients, Benefits & Usage Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
          <h2 className="font-display text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-henna-600" />
            Ayurvedic Specifications & Guide
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Key Benefits (One per line)</label>
              <textarea
                rows={4}
                value={formData.benefits}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, benefits: e.target.value }))
                }
                placeholder="100% pure & chemical-free&#10;Deep reddish-brown rich stain&#10;Cools scalp and conditions hair"
                className="input font-mono text-xs"
              />
            </div>

            <div>
              <label className="label">Botanical Ingredients (One per line)</label>
              <textarea
                rows={4}
                value={formData.ingredients}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ingredients: e.target.value }))
                }
                placeholder="Pure Lawsonia Inermis (Henna) Leaf Powder 100%"
                className="input font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="label">Usage Instructions / Recipe Guide</label>
            <textarea
              rows={3}
              value={formData.usage_instructions}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, usage_instructions: e.target.value }))
              }
              placeholder="Mix with warm water and lemon juice. Rest for 4-6 hours to release natural lawsonia dye..."
              className="input"
            />
          </div>
        </div>

        {/* Product Media & Cloudflare R2 Upload Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-henna-600" />
                Product Media &amp; Cloudflare R2 Storage
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload product photos or videos directly to Cloudflare R2 / storage bucket.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-henna-50 border border-henna-100 text-[11px] font-bold text-henna-800">
              R2 Bucket Ready
            </span>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="border-2 border-dashed border-gray-200 hover:border-henna-500 rounded-2xl p-6 transition-all text-center bg-gray-50/50 hover:bg-henna-50/20 relative group">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title="Click or drop file to upload to R2"
            />

            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-gray-200 flex items-center justify-center text-henna-600 group-hover:scale-110 transition-transform">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-henna-600" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>

              <div>
                <span className="font-semibold text-sm text-gray-900 block">
                  {uploading ? 'Uploading to R2 Bucket...' : 'Click to Upload or Drag & Drop'}
                </span>
                <span className="text-xs text-gray-400">
                  Supports High-Res Images (JPG, PNG, WEBP) &amp; Videos (MP4) up to 50MB
                </span>
              </div>
            </div>

            {/* Live Upload Progress */}
            {uploading && (
              <div className="mt-4 max-w-xs mx-auto space-y-1.5">
                <div className="flex items-center justify-between text-xs text-henna-800 font-semibold">
                  <span>Uploading to Bucket...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-henna-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Media Preview & Metadata Card */}
          {formData.primary_image_url && (
            <div className="p-4 rounded-2xl bg-earth-50 border border-earth-100 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-gray-200 flex-shrink-0 shadow-xs">
                {formData.primary_image_url.includes('.mp4') || formData.primary_image_url.includes('.webm') ? (
                  <video
                    src={formData.primary_image_url}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={formData.primary_image_url}
                    alt="Uploaded product preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div className="flex-1 space-y-1 text-xs text-gray-600 text-center sm:text-left overflow-hidden">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-bold text-gray-900">
                    {mediaInfo?.fileName || 'Attached Media File'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold">
                    {mediaInfo?.provider || 'R2 Bucket Verified'}
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 font-mono truncate">
                  {formData.primary_image_url}
                </p>

                {mediaInfo?.size && (
                  <p className="text-[11px] text-gray-500">
                    Size: {(mediaInfo.size / (1024 * 1024)).toFixed(2)} MB &bull; Type: {mediaInfo.type}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, primary_image_url: '' }));
                  setMediaInfo(null);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl border border-transparent hover:border-red-100 transition"
                title="Remove Media"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Direct URL input fallback */}
          <div>
            <label className="label">
              Direct CDN / Public Media URL (Optional override)
            </label>
            <input
              type="url"
              value={formData.primary_image_url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, primary_image_url: e.target.value }))
              }
              placeholder="https://pub-xxxx.r2.dev/products/henna.jpg or direct image URL"
              className="input font-mono text-xs"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isEditMode ? 'Update Product' : 'Create Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
