import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Review } from '../types/database';

export interface ReviewFilters {
  is_approved?: boolean;
  is_featured?: boolean;
  product_id?: string;
  userId?: string;
}

// Hook to fetch reviews with optional filters
export function useReviews(filters?: ReviewFilters) {
  return useQuery<Review[], Error>({
    queryKey: ['reviews', filters],
    queryFn: async () => {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });

      if (filters?.is_approved !== undefined) {
        query = query.eq('is_approved', filters.is_approved);
      }
      if (filters?.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }
      if (filters?.product_id) {
        query = query.eq('product_id', filters.product_id);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Review[];
    },
  });
}

// Hook to fetch a single review by id
export function useReview(id: string | undefined) {
  return useQuery<Review | null, Error>({
    queryKey: ['reviews', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('reviews').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Review;
    },
  });
}
