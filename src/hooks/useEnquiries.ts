import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Enquiry, ManufacturingEnquiry } from '../types/database';

export interface EnquiryFilters {
  status?: Enquiry['status'];
  type?: Enquiry['type'];
  userId?: string;
}

export interface ManufacturingEnquiryFilters {
  status?: ManufacturingEnquiry['status'];
  userId?: string;
}

// Hook to fetch general/wholesale enquiries with optional status and type filters
export function useEnquiries(filters?: EnquiryFilters) {
  return useQuery<Enquiry[], Error>({
    queryKey: ['enquiries', filters],
    queryFn: async () => {
      let query = supabase.from('enquiries').select('*').order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Enquiry[];
    },
  });
}

// Hook to fetch a single enquiry by id
export function useEnquiry(id: string | undefined) {
  return useQuery<Enquiry | null, Error>({
    queryKey: ['enquiries', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('enquiries').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Enquiry;
    },
  });
}

// Hook to fetch manufacturing enquiries with optional status filter
export function useManufacturingEnquiries(filters?: ManufacturingEnquiryFilters) {
  return useQuery<ManufacturingEnquiry[], Error>({
    queryKey: ['manufacturing_enquiries', filters],
    queryFn: async () => {
      let query = supabase
        .from('manufacturing_enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ManufacturingEnquiry[];
    },
  });
}

// Hook to fetch a single manufacturing enquiry by id
export function useManufacturingEnquiry(id: string | undefined) {
  return useQuery<ManufacturingEnquiry | null, Error>({
    queryKey: ['manufacturing_enquiries', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('manufacturing_enquiries')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ManufacturingEnquiry;
    },
  });
}
