import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Product, ProductImage } from '../types/database';

export interface ProductFilters {
  category_id?: string;
  is_active?: boolean;
  is_featured?: boolean;
  search?: string;
}

export interface ProductWithImages extends Product {
  product_images: ProductImage[];
}

// Hook to fetch a list of products with optional filters
export function useProducts(options?: ProductFilters) {
  return useQuery<Product[], Error>({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });

      if (options?.category_id) {
        query = query.eq('category_id', options.category_id);
      }
      if (options?.is_active !== undefined) {
        query = query.eq('is_active', options.is_active);
      }
      if (options?.is_featured !== undefined) {
        query = query.eq('is_featured', options.is_featured);
      }
      if (options?.search) {
        query = query.ilike('name', `%${options.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });
}

// Hook to fetch a single product with its images
export function useProduct(id: string | undefined) {
  return useQuery<ProductWithImages | null, Error>({
    queryKey: ['products', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;

      const [productRes, imagesRes] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id)
          .order('display_order', { ascending: true }),
      ]);

      if (productRes.error) throw productRes.error;
      if (imagesRes.error) throw imagesRes.error;

      return {
        ...(productRes.data as Product),
        product_images: (imagesRes.data ?? []) as ProductImage[],
      };
    },
  });
}
