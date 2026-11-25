import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Order, OrderItem } from '../types/database';

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

// Hook to fetch orders list.
// If userId is provided, filters to that user's orders (customer view).
// If userId is undefined, returns all orders (admin view).
export function useOrders(userId?: string) {
  return useQuery<Order[], Error>({
    queryKey: ['orders', userId ?? 'all'],
    staleTime: 30_000,
    queryFn: async () => {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  });
}

// Hook to fetch a single order with all its order_items
export function useOrder(orderId: string | undefined) {
  return useQuery<OrderWithItems | null, Error>({
    queryKey: ['orders', orderId],
    enabled: !!orderId,
    staleTime: 30_000,
    queryFn: async () => {
      if (!orderId) return null;

      const [orderRes, itemsRes] = await Promise.all([
        supabase.from('orders').select('*').eq('id', orderId).single(),
        supabase.from('order_items').select('*').eq('order_id', orderId),
      ]);

      if (orderRes.error) throw orderRes.error;
      if (itemsRes.error) throw itemsRes.error;

      return {
        ...(orderRes.data as Order),
        order_items: (itemsRes.data ?? []) as OrderItem[],
      };
    },
  });
}
