// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at'>>;
      };
      product_images: {
        Row: ProductImage;
        Insert: Omit<ProductImage, 'id' | 'created_at'>;
        Update: Partial<Omit<ProductImage, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id'>;
        Update: Partial<Omit<OrderItem, 'id'>>;
      };
      enquiries: {
        Row: Enquiry;
        Insert: Omit<Enquiry, 'id' | 'created_at'>;
        Update: Partial<Omit<Enquiry, 'id' | 'created_at'>>;
      };
      manufacturing_enquiries: {
        Row: ManufacturingEnquiry;
        Insert: Omit<ManufacturingEnquiry, 'id' | 'created_at'>;
        Update: Partial<Omit<ManufacturingEnquiry, 'id' | 'created_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at'>;
        Update: Partial<Omit<Review, 'id' | 'created_at'>>;
      };
      addresses: {
        Row: Address;
        Insert: Omit<Address, 'id' | 'created_at'>;
        Update: Partial<Omit<Address, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  pack_size: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  category_id: string | null;
  tags: string[] | null;
  benefits: string[] | null;
  ingredients: string[] | null;
  usage_instructions: string | null;
  primary_image_url?: string | null;
  images?: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  object_key: string | null;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total_amount: number;
  subtotal: number;
  shipping_amount: number;
  tax_amount: number;
  shipping_address: Address | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price_snapshot: number;
  quantity: number;
  pack_size: string;
  subtotal: number;
}

export interface Enquiry {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  product_interest: string | null;
  quantity_required: string | null;
  message: string;
  type: 'general' | 'wholesale';
  status: 'new' | 'read' | 'replied' | 'closed';
  admin_notes: string | null;
  created_at: string;
}

export interface ManufacturingEnquiry {
  id: string;
  user_id: string | null;
  name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  brand_name: string | null;
  products_required: string | null;
  estimated_quantity: string | null;
  packaging_requirements: string | null;
  message: string | null;
  status: 'new' | 'reviewing' | 'quoted' | 'confirmed' | 'closed';
  admin_notes: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string | null;
  product_id: string | null;
  customer_name: string;
  customer_country: string | null;
  rating: number;
  title: string | null;
  content: string;
  is_approved: boolean;
  is_featured: boolean;
  admin_notes: string | null;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}
