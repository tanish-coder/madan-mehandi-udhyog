import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Product, Category } from '../../types/database';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Tag,
  Package,
  Layers,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true }),
        supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true })
      ]);

      if (prodRes.error) throw prodRes.error;
      if (catRes.error) throw catRes.error;

      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err: any) {
      toast.error('Failed to load products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  // Toggle active status
  const handleToggleActive = async (product: Product) => {
    const updatedStatus = !product.is_active;
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: updatedStatus, updated_at: new Date().toISOString() })
        .eq('id', product.id);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: updatedStatus } : p))
      );
      toast.success(`${product.name} is now ${updatedStatus ? 'Active' : 'Inactive'}`);
    } catch (err: any) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (product: Product) => {
    const updatedStatus = !product.is_featured;
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: updatedStatus, updated_at: new Date().toISOString() })
        .eq('id', product.id);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_featured: updatedStatus } : p))
      );
      toast.success(`${product.name} ${updatedStatus ? 'marked as Featured' : 'unmarked from Featured'}`);
    } catch (err: any) {
      toast.error('Failed to update featured: ' + err.message);
    }
  };

  // Delete product
  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', deleteId);
      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteId));
      toast.success('Product deleted successfully');
      setDeleteId(null);
    } catch (err: any) {
      toast.error('Failed to delete product: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk active/inactive
  const handleBulkStatus = async (isActive: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .in('id', selectedIds);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, is_active: isActive } : p))
      );
      toast.success(`Updated ${selectedIds.length} products to ${isActive ? 'Active' : 'Inactive'}`);
      setSelectedIds([]);
    } catch (err: any) {
      toast.error('Bulk update failed: ' + err.message);
    }
  };

  // Filter & sort
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    const matchesCategory =
      selectedCategory === 'all' || p.category_id === selectedCategory;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.is_active) ||
      (statusFilter === 'inactive' && !p.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
    else if (sortBy === 'price') comparison = a.price - b.price;
    else if (sortBy === 'stock') comparison = a.stock_quantity - b.stock_quantity;
    else if (sortBy === 'date') comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-gray-900">Product Catalogue</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-henna-100 text-henna-800">
              {products.length} Products
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage your Sojat henna and Ayurvedic botanical powder inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProductsAndCategories}
            className="p-2.5 text-gray-500 hover:text-henna-700 hover:bg-henna-50 rounded-xl border border-gray-200 transition-colors"
            title="Refresh Products"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/admin/products/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name, slug, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-henna-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-henna-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-henna-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-henna-50/70 border border-henna-200 rounded-lg text-xs">
            <span className="font-medium text-henna-900">
              {selectedIds.length} product(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatus(true)}
                className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded text-gray-700 font-medium transition"
              >
                Mark Active
              </button>
              <button
                onClick={() => handleBulkStatus(false)}
                className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded text-gray-700 font-medium transition"
              >
                Mark Inactive
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-gray-500 hover:text-gray-700 underline"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500">Loading real product data from Supabase...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700">No products found</h3>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search keyword</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedIds.length === filteredProducts.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredProducts.map((p) => p.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="rounded border-gray-300 text-henna-600 focus:ring-henna-500"
                    />
                  </th>
                  <th className="p-4 cursor-pointer hover:text-gray-900" onClick={() => {
                    setSortBy('name');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}>
                    <div className="flex items-center gap-1.5">
                      <span>Product</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="p-4">Category</th>
                  <th className="p-4 cursor-pointer hover:text-gray-900" onClick={() => {
                    setSortBy('price');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}>
                    <div className="flex items-center gap-1.5">
                      <span>Price</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="p-4">Pack Size</th>
                  <th className="p-4 cursor-pointer hover:text-gray-900" onClick={() => {
                    setSortBy('stock');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}>
                    <div className="flex items-center gap-1.5">
                      <span>Stock</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="p-4">Featured</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProducts.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  const isLowStock = product.stock_quantity < 20;
                  const isOutOfStock = product.stock_quantity === 0;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-henna-50/30 transition-colors ${
                        isSelected ? 'bg-henna-50/50' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, product.id]);
                            } else {
                              setSelectedIds((prev) => prev.filter((id) => id !== product.id));
                            }
                          }}
                          className="rounded border-gray-300 text-henna-600 focus:ring-henna-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-earth-100 border border-earth-200 flex items-center justify-center text-earth-800 font-bold font-serif text-sm flex-shrink-0">
                            {product.name.charAt(0)}
                          </div>
                          <div>
                            <Link
                              to={`/admin/products/${product.id}/edit`}
                              className="font-semibold text-gray-900 hover:text-henna-600 transition"
                            >
                              {product.name}
                            </Link>
                            <p className="text-xs text-gray-400 font-mono">/{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {categoryMap.get(product.category_id || '') || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-900">
                        ₹{Number(product.price).toFixed(2)}
                        {product.original_price && (
                          <span className="block text-xs font-normal text-gray-400 line-through">
                            ₹{Number(product.original_price).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600 text-xs">
                        {product.pack_size || '100 gm'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              isOutOfStock
                                ? 'bg-red-500'
                                : isLowStock
                                ? 'bg-amber-500'
                                : 'bg-green-500'
                            }`}
                          />
                          <span
                            className={`text-xs font-medium ${
                              isOutOfStock
                                ? 'text-red-700'
                                : isLowStock
                                ? 'text-amber-700'
                                : 'text-gray-700'
                            }`}
                          >
                            {product.stock_quantity} units
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          className={`text-xs px-2 py-1 rounded-full font-medium transition ${
                            product.is_featured
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {product.is_featured ? '★ Featured' : '☆ Standard'}
                        </button>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold transition ${
                            product.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {product.is_active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="p-1.5 text-gray-500 hover:text-henna-700 hover:bg-henna-50 rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setDeleteId(product.id);
                              setDeleteName(product.name);
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteName}"? This action removes the product from Supabase and cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Product'}
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
