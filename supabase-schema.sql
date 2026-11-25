-- ============================================================
-- Madan Mehandi Udhyog (MMU) — Supabase Database Schema
-- ============================================================
-- Run this entire file in the Supabase SQL Editor (once).
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. Extensions
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 2. TABLES
-- ─────────────────────────────────────────────────────────────

-- 2.1 profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  full_name     TEXT,
  phone         TEXT,
  role          TEXT        NOT NULL DEFAULT 'customer'
                            CHECK (role IN ('customer', 'admin')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 1. HELPER FUNCTION: is_admin()
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 2.2 categories
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 products
CREATE TABLE IF NOT EXISTS public.products (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT          NOT NULL,
  slug                TEXT          NOT NULL UNIQUE,
  description         TEXT,
  short_description   TEXT,
  price               NUMERIC(10,2) NOT NULL,
  original_price      NUMERIC(10,2),
  pack_size           TEXT          NOT NULL DEFAULT '100 gm',
  stock_quantity      INT           NOT NULL DEFAULT 0,
  is_active           BOOLEAN       NOT NULL DEFAULT true,
  is_featured         BOOLEAN       NOT NULL DEFAULT false,
  category_id         UUID          REFERENCES public.categories(id) ON DELETE SET NULL,
  tags                TEXT[],
  benefits            TEXT[],
  ingredients         TEXT[],
  usage_instructions  TEXT,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 2.4 product_images
CREATE TABLE IF NOT EXISTS public.product_images (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url           TEXT        NOT NULL,
  object_key    TEXT,
  alt_text      TEXT,
  display_order INT         NOT NULL DEFAULT 0,
  is_primary    BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT        NOT NULL,
  phone       TEXT        NOT NULL,
  line1       TEXT        NOT NULL,
  line2       TEXT,
  city        TEXT        NOT NULL,
  state       TEXT        NOT NULL,
  postal_code TEXT        NOT NULL,
  country     TEXT        NOT NULL DEFAULT 'India',
  is_default  BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.6 orders
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status            TEXT          NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  total_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal          NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_amount   NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_address  JSONB,
  payment_status    TEXT          NOT NULL DEFAULT 'pending'
                                  CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_method    TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 2.7 order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID          NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id      UUID          REFERENCES public.products(id) ON DELETE SET NULL,
  product_name    TEXT          NOT NULL,
  price_snapshot  NUMERIC(10,2) NOT NULL,
  quantity        INT           NOT NULL DEFAULT 1,
  pack_size       TEXT,
  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- 2.8 enquiries
CREATE TABLE IF NOT EXISTS public.enquiries (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name         TEXT        NOT NULL,
  email             TEXT        NOT NULL,
  phone             TEXT,
  country           TEXT,
  product_interest  TEXT,
  quantity_required TEXT,
  message           TEXT,
  type              TEXT        NOT NULL DEFAULT 'general'
                                CHECK (type IN ('general','wholesale')),
  status            TEXT        NOT NULL DEFAULT 'new'
                                CHECK (status IN ('new','read','replied','closed')),
  admin_notes       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.9 manufacturing_enquiries
CREATE TABLE IF NOT EXISTS public.manufacturing_enquiries (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  name                   TEXT        NOT NULL,
  company_name           TEXT,
  email                  TEXT        NOT NULL,
  phone                  TEXT,
  country                TEXT,
  brand_name             TEXT,
  products_required      TEXT,
  estimated_quantity     TEXT,
  packaging_requirements TEXT,
  message                TEXT,
  status                 TEXT        NOT NULL DEFAULT 'new'
                                     CHECK (status IN ('new','reviewing','quoted','confirmed','closed')),
  admin_notes            TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.10 reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id       UUID        REFERENCES public.products(id) ON DELETE SET NULL,
  customer_name    TEXT        NOT NULL,
  customer_country TEXT,
  rating           INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title            TEXT,
  content          TEXT,
  is_approved      BOOLEAN     NOT NULL DEFAULT false,
  is_featured      BOOLEAN     NOT NULL DEFAULT false,
  admin_notes      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 3. INDEXES
-- ─────────────────────────────────────────────────────────────

-- products
CREATE INDEX IF NOT EXISTS idx_products_slug        ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category    ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active   ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at  ON public.products(created_at DESC);

-- product_images
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- addresses
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- enquiries
CREATE INDEX IF NOT EXISTS idx_enquiries_user_id    ON public.enquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status     ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at DESC);

-- manufacturing_enquiries
CREATE INDEX IF NOT EXISTS idx_mfg_enquiries_user_id    ON public.manufacturing_enquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_mfg_enquiries_status     ON public.manufacturing_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_mfg_enquiries_created_at ON public.manufacturing_enquiries(created_at DESC);

-- reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id  ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_is_featured ON public.reviews(is_featured);

-- ─────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY — Enable
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturing_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews                 ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- 5. RLS POLICIES
-- ─────────────────────────────────────────────────────────────

-- ── profiles ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_select"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- ── categories ────────────────────────────────────────────────
DROP POLICY IF EXISTS "categories_public_read"   ON public.categories;
DROP POLICY IF EXISTS "categories_admin_insert"  ON public.categories;
DROP POLICY IF EXISTS "categories_admin_update"  ON public.categories;
DROP POLICY IF EXISTS "categories_admin_delete"  ON public.categories;

CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "categories_admin_insert"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_admin_update"
  ON public.categories FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "categories_admin_delete"
  ON public.categories FOR DELETE
  USING (public.is_admin());

-- ── products ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "products_public_read"   ON public.products;
DROP POLICY IF EXISTS "products_admin_insert"  ON public.products;
DROP POLICY IF EXISTS "products_admin_update"  ON public.products;
DROP POLICY IF EXISTS "products_admin_delete"  ON public.products;

CREATE POLICY "products_public_read"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "products_admin_insert"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_update"
  ON public.products FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "products_admin_delete"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- ── product_images ────────────────────────────────────────────
DROP POLICY IF EXISTS "product_images_public_read"  ON public.product_images;
DROP POLICY IF EXISTS "product_images_admin_insert" ON public.product_images;
DROP POLICY IF EXISTS "product_images_admin_update" ON public.product_images;
DROP POLICY IF EXISTS "product_images_admin_delete" ON public.product_images;

CREATE POLICY "product_images_public_read"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "product_images_admin_insert"
  ON public.product_images FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "product_images_admin_update"
  ON public.product_images FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "product_images_admin_delete"
  ON public.product_images FOR DELETE
  USING (public.is_admin());

-- ── addresses ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "addresses_user_select" ON public.addresses;
DROP POLICY IF EXISTS "addresses_user_insert" ON public.addresses;
DROP POLICY IF EXISTS "addresses_user_update" ON public.addresses;
DROP POLICY IF EXISTS "addresses_user_delete" ON public.addresses;

CREATE POLICY "addresses_user_select"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "addresses_user_insert"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_user_update"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_user_delete"
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id);

-- ── orders ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "orders_user_select"   ON public.orders;
DROP POLICY IF EXISTS "orders_user_insert"   ON public.orders;
DROP POLICY IF EXISTS "orders_admin_select"  ON public.orders;
DROP POLICY IF EXISTS "orders_admin_update"  ON public.orders;

CREATE POLICY "orders_user_select"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "orders_user_insert"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_admin_select"
  ON public.orders FOR SELECT
  USING (public.is_admin());

CREATE POLICY "orders_admin_update"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- ── order_items ───────────────────────────────────────────────
DROP POLICY IF EXISTS "order_items_user_select"  ON public.order_items;
DROP POLICY IF EXISTS "order_items_user_insert"  ON public.order_items;
DROP POLICY IF EXISTS "order_items_admin_select" ON public.order_items;

CREATE POLICY "order_items_user_select"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_user_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_admin_select"
  ON public.order_items FOR SELECT
  USING (public.is_admin());

-- ── enquiries ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "enquiries_public_insert" ON public.enquiries;
DROP POLICY IF EXISTS "enquiries_user_select"   ON public.enquiries;
DROP POLICY IF EXISTS "enquiries_admin_select"  ON public.enquiries;
DROP POLICY IF EXISTS "enquiries_admin_update"  ON public.enquiries;

CREATE POLICY "enquiries_public_insert"
  ON public.enquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "enquiries_user_select"
  ON public.enquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "enquiries_admin_select"
  ON public.enquiries FOR SELECT
  USING (public.is_admin());

CREATE POLICY "enquiries_admin_update"
  ON public.enquiries FOR UPDATE
  USING (public.is_admin());

-- ── manufacturing_enquiries ───────────────────────────────────
DROP POLICY IF EXISTS "mfg_enquiries_public_insert" ON public.manufacturing_enquiries;
DROP POLICY IF EXISTS "mfg_enquiries_user_select"   ON public.manufacturing_enquiries;
DROP POLICY IF EXISTS "mfg_enquiries_admin_select"  ON public.manufacturing_enquiries;
DROP POLICY IF EXISTS "mfg_enquiries_admin_update"  ON public.manufacturing_enquiries;

CREATE POLICY "mfg_enquiries_public_insert"
  ON public.manufacturing_enquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "mfg_enquiries_user_select"
  ON public.manufacturing_enquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "mfg_enquiries_admin_select"
  ON public.manufacturing_enquiries FOR SELECT
  USING (public.is_admin());

CREATE POLICY "mfg_enquiries_admin_update"
  ON public.manufacturing_enquiries FOR UPDATE
  USING (public.is_admin());

-- ── reviews ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "reviews_public_select"  ON public.reviews;
DROP POLICY IF EXISTS "reviews_user_insert"    ON public.reviews;
DROP POLICY IF EXISTS "reviews_admin_update"   ON public.reviews;
DROP POLICY IF EXISTS "reviews_admin_delete"   ON public.reviews;

CREATE POLICY "reviews_public_select"
  ON public.reviews FOR SELECT
  USING (is_approved = true OR public.is_admin());

CREATE POLICY "reviews_user_insert"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "reviews_admin_update"
  ON public.reviews FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "reviews_admin_delete"
  ON public.reviews FOR DELETE
  USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- 6. AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 7. UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.products;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.orders;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─────────────────────────────────────────────────────────────
-- 8. SEED DATA
-- ─────────────────────────────────────────────────────────────

-- 8.1 Categories
INSERT INTO public.categories (id, name, slug, description) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Henna Powders',  'henna-powders',  'Premium henna powders for hair and skin'),
  ('a1000000-0000-0000-0000-000000000002', 'Herbal Powders',  'herbal-powders', 'Natural herbal powders for health and wellness'),
  ('a1000000-0000-0000-0000-000000000003', 'Beauty Powders',  'beauty-powders', 'Natural beauty and skincare powders'),
  ('a1000000-0000-0000-0000-000000000004', 'Hair Care',       'hair-care',      'Natural hair care products')
ON CONFLICT (slug) DO NOTHING;

-- 8.2 Products (all 15 MMU products)
INSERT INTO public.products
  (id, name, slug, short_description, description, price, original_price, pack_size,
   stock_quantity, is_active, is_featured, category_id,
   tags, benefits, ingredients)
VALUES

-- ─ Henna Powders ─────────────────────────────────────────────
(
  'b1000000-0000-0000-0000-000000000001',
  'Henna Powder',
  'henna-powder',
  'Pure natural henna powder for vibrant hair color and conditioning.',
  'Our Henna Powder is made from the finest Lawsonia inermis leaves, finely milled and sieved for consistent, vibrant color. It provides a rich reddish-brown dye while deeply conditioning and strengthening hair. Completely natural, free from PPD and chemicals.',
  299.00, 399.00, '100 gm', 100, true, true,
  'a1000000-0000-0000-0000-000000000001',
  ARRAY['henna', 'hair color', 'natural', 'mehandi'],
  ARRAY['Natural hair coloring', 'Deep conditioning', 'Strengthens hair', 'Reduces dandruff', 'Improves scalp health'],
  ARRAY['Pure Lawsonia Inermis (Henna) Leaf Powder']
),
(
  'b1000000-0000-0000-0000-000000000002',
  '3 Filter Henna Powder',
  '3-filter-henna-powder',
  'Triple-filtered henna powder for ultra-smooth, clog-free application.',
  'Our 3 Filter Henna Powder is passed through three progressive sieves to ensure an exceptionally fine, lump-free texture. This makes it perfect for body art cones, delivering sharp and clean designs. Maintains full dye release and conditioning properties.',
  299.00, 399.00, '100 gm', 100, true, true,
  'a1000000-0000-0000-0000-000000000001',
  ARRAY['henna', 'triple filter', 'body art', 'mehndi cone'],
  ARRAY['Ultra-fine texture', 'Clog-free cones', 'Vibrant stain', 'Smooth application', 'Consistent dye release'],
  ARRAY['Pure Lawsonia Inermis (Henna) Leaf Powder — Triple Filtered']
),
(
  'b1000000-0000-0000-0000-000000000003',
  'Herbal Henna Powder',
  'herbal-henna-powder',
  'Henna blended with Ayurvedic herbs for enhanced hair benefits.',
  'Our Herbal Henna Powder is a specially crafted blend of pure henna with traditional Ayurvedic herbs. The added botanicals amplify color depth, promote hair growth, and create a naturally glossy finish. Ideal for those seeking a holistic hair care routine.',
  299.00, 399.00, '100 gm', 100, true, true,
  'a1000000-0000-0000-0000-000000000001',
  ARRAY['herbal henna', 'ayurvedic', 'hair care', 'natural dye'],
  ARRAY['Enhanced color depth', 'Promotes hair growth', 'Natural shine', 'Strengthens roots', 'Reduces breakage'],
  ARRAY['Lawsonia Inermis (Henna)', 'Amla', 'Shikakai', 'Brahmi', 'Neem']
),
(
  'b1000000-0000-0000-0000-000000000004',
  'Organic Henna Powder',
  'organic-henna-powder',
  'Certified organic henna powder — pure, chemical-free, ethically sourced.',
  'Our Organic Henna Powder is organically grown without synthetic pesticides or fertilisers, then cold-processed to preserve maximum dye content. Certified chemical-free, it is perfect for sensitive scalps and eco-conscious customers seeking full-strength natural color.',
  299.00, 399.00, '100 gm', 100, true, true,
  'a1000000-0000-0000-0000-000000000001',
  ARRAY['organic', 'henna', 'chemical-free', 'certified'],
  ARRAY['Chemical-free coloring', 'Sensitive-scalp safe', 'Eco-friendly', 'Maximum lawsone content', 'Long-lasting color'],
  ARRAY['Certified Organic Lawsonia Inermis (Henna) Leaf Powder']
),
(
  'b1000000-0000-0000-0000-000000000005',
  'Indigo Powder',
  'indigo-powder',
  'Pure indigo powder for natural dark brown to black hair color.',
  'Derived from Indigofera tinctoria leaves, our Indigo Powder is used after a henna application to achieve rich dark brown or jet-black tones naturally. It is 100% plant-based, free from ammonia, peroxide, and PPD. Also beneficial for scalp health.',
  299.00, 399.00, '100 gm', 100, true, true,
  'a1000000-0000-0000-0000-000000000001',
  ARRAY['indigo', 'black hair', 'dark brown', 'natural dye'],
  ARRAY['Achieves dark brown to black tones', 'Covers grey hair', 'Strengthens hair shaft', 'Improves scalp condition', 'Chemical-free'],
  ARRAY['Pure Indigofera Tinctoria (Indigo) Leaf Powder']
),

-- ─ Herbal / Health Powders ───────────────────────────────────
(
  'b1000000-0000-0000-0000-000000000006',
  'Moringa Powder',
  'moringa-powder',
  'Nutrient-dense moringa leaf powder — the superfood supplement.',
  'Harvested from mature Moringa oleifera leaves and gently dried at low temperature, our Moringa Powder retains its impressive nutritional profile including vitamins A, C, E, calcium, potassium, and all essential amino acids. Can be used in smoothies, teas, face packs, and hair masks.',
  299.00, 399.00, '100 gm', 100, true, true,
  'a1000000-0000-0000-0000-000000000002',
  ARRAY['moringa', 'superfood', 'nutrition', 'green powder'],
  ARRAY['Rich in antioxidants', 'Boosts immunity', 'Improves hair and skin', 'Anti-inflammatory', 'Energy booster'],
  ARRAY['Pure Moringa Oleifera Leaf Powder']
),
(
  'b1000000-0000-0000-0000-000000000007',
  'Multani Mitti Powder',
  'multani-mitti-powder',
  'Natural Fuller''s Earth powder for deep cleansing and glowing skin.',
  'Multani Mitti (Fuller''s Earth) has been used in Indian beauty rituals for centuries. Our powder is naturally sourced, sun-dried, and finely milled. It draws out impurities, absorbs excess oil, and tightens pores, leaving skin refreshed and radiant.',
  299.00, 399.00, '100 gm', 100, true, false,
  'a1000000-0000-0000-0000-000000000003',
  ARRAY['multani mitti', 'fuller earth', 'face pack', 'skin care'],
  ARRAY['Deep pore cleansing', 'Oil control', 'Skin brightening', 'Removes tan', 'Tightens pores'],
  ARRAY['Natural Fuller''s Earth (Multani Mitti)']
),
(
  'b1000000-0000-0000-0000-000000000008',
  'Neem Powder',
  'neem-powder',
  'Antibacterial neem leaf powder for skin, hair, and oral health.',
  'Our Neem Powder is made from shade-dried Azadirachta indica leaves, retaining maximum azadirachtin and other active compounds. Renowned for its antibacterial, antifungal, and anti-inflammatory properties, it is widely used in face masks, hair packs, and natural toothpowder formulations.',
  299.00, 399.00, '100 gm', 100, true, false,
  'a1000000-0000-0000-0000-000000000002',
  ARRAY['neem', 'antibacterial', 'antifungal', 'ayurvedic'],
  ARRAY['Fights dandruff and scalp infections', 'Acne control', 'Antifungal properties', 'Strengthens teeth and gums', 'Natural pesticide for plants'],
  ARRAY['Pure Azadirachta Indica (Neem) Leaf Powder']
),
(
  'b1000000-0000-0000-0000-000000000009',
  'Amla Powder',
  'amla-powder',
  'Vitamin C-rich Indian gooseberry powder for hair growth and immunity.',
  'Amla (Indian Gooseberry) is one of the richest natural sources of Vitamin C. Our Amla Powder is made from sun-dried, stone-ground amla fruits. It promotes hair growth, prevents premature greying, boosts immunity, and improves digestion when consumed as a supplement.',
  299.00, 399.00, '100 gm', 100, true, false,
  'a1000000-0000-0000-0000-000000000004',
  ARRAY['amla', 'vitamin c', 'hair growth', 'gooseberry'],
  ARRAY['Prevents premature greying', 'Promotes hair growth', 'Boosts immunity', 'Rich in Vitamin C', 'Improves digestion'],
  ARRAY['Pure Phyllanthus Emblica (Amla / Indian Gooseberry) Fruit Powder']
),
(
  'b1000000-0000-0000-0000-000000000010',
  'Shikakai Powder',
  'shikakai-powder',
  'Natural hair cleanser and conditioner — the original shampoo.',
  'Shikakai (Acacia concinna) has been used as a natural shampoo in India for thousands of years. Its low pH gently cleanses without stripping natural oils, while saponins create a natural lather. Our powder promotes hair growth and adds natural shine.',
  299.00, 399.00, '100 gm', 100, true, false,
  'a1000000-0000-0000-0000-000000000004',
  ARRAY['shikakai', 'natural shampoo', 'hair cleanser', 'ayurvedic'],
  ARRAY['Gentle natural cleansing', 'Promotes hair growth', 'Adds shine', 'Prevents hair loss', 'Scalp nourishment'],
  ARRAY['Pure Acacia Concinna (Shikakai) Pod Powder']
),
(
  'b1000000-0000-0000-0000-000000000011',
  'Reetha Powder',
  'reetha-powder',
  'Soapnut powder — natural foaming agent for hair and skin cleansing.',
  'Reetha (Sapindus mukorossi), also called soapnut, contains natural saponins that create a gentle lather. Our Reetha Powder is an excellent natural cleanser for hair and skin. It is especially beneficial for curly, dry, or colour-treated hair, leaving it soft and manageable.',
  299.00, 399.00, '100 gm', 100, true, false,
  'a1000000-0000-0000-0000-000000000004',
  ARRAY['reetha', 'soapnut', 'natural cleanser', 'saponins'],
  ARRAY['Natural lathering cleanser', 'Softens hair', 'Colour-safe', 'Gentle on scalp', 'Reduces frizz'],
  ARRAY['Pure Sapindus Mukorossi (Reetha / Soapnut) Fruit Powder']
),

-- ─ Beauty Powders ─────────────────────────────────────────────
(
  'b1000000-0000-0000-0000-000000000012',
  'Hibiscus Powder',
  'hibiscus-powder',
  'Vibrant hibiscus flower powder for hair growth and skin radiance.',
  'Made from dried Hibiscus rosa-sinensis flowers and leaves, our Hibiscus Powder is rich in amino acids and vitamins. It naturally conditions hair, stimulates hair follicles to reduce hair fall, and when used as a face pack, provides a natural rosy glow.',
  299.00, 399.00, '100 gm', 100, true, false,
  'a1000000-0000-0000-0000-000000000003',
  ARRAY['hibiscus', 'hair growth', 'flower powder', 'anti-ageing'],
  ARRAY['Reduces hair fall', 'Stimulates hair growth', 'Natural hair conditioner', 'Anti-ageing skin benefits', 'Natural pink tint for skin'],
  ARRAY['Pure Hibiscus Rosa-Sinensis Flower & Leaf Powder']
),
(
  'b1000000-0000-0000-0000-000000000013',
  'Orange Powder',
  'orange-powder',
  'Vitamin C-rich orange peel powder for brightening skin.',
  'Our Orange Peel Powder is made from sun-dried, pesticide-free orange peels that are finely milled. Rich in Vitamin C and antioxidants, it brightens skin, reduces dark spots and pigmentation, and tightens pores. It is a popular ingredient in DIY face packs and scrubs.',
  299.00, 399.00, '100 gm', 100, true, false,
  'a1000000-0000-0000-0000-000000000003',
  ARRAY['orange peel', 'vitamin c', 'skin brightening', 'face pack'],
  ARRAY['Skin brightening', 'Reduces pigmentation', 'Rich in antioxidants', 'Pore tightening', 'Natural exfoliation'],
  ARRAY['Pure Citrus Sinensis (Orange) Peel Powder']
),
(
  'b1000000-0000-0000-0000-000000000014',
  'Rose Powder',
  'rose-powder',
  'Luxurious rose petal powder for hydrating and soothing skin.',
  'Crafted from premium dried Rosa damascena (Damask Rose) petals, our Rose Powder carries a delicate floral fragrance. It hydrates and soothes irritated skin, reduces redness, and provides a natural rosy glow. Perfect for face masks, bath soaks, and DIY cosmetics.',
  299.00, 399.00, '100 gm', 100, true, false,
  'a1000000-0000-0000-0000-000000000003',
  ARRAY['rose', 'rose petal', 'skin soothing', 'hydrating'],
  ARRAY['Deep hydration', 'Soothes irritation', 'Natural fragrance', 'Anti-inflammatory', 'Brightens complexion'],
  ARRAY['Pure Rosa Damascena (Damask Rose) Petal Powder']
),
(
  'b1000000-0000-0000-0000-000000000015',
  'Beetroot Powder',
  'beetroot-powder',
  'Natural beetroot powder — vibrant lip and cheek tint and health supplement.',
  'Our Beetroot Powder is cold-processed from fresh Beta vulgaris beets to preserve its vivid colour and nutritional richness. Loaded with betalains, iron, and folate, it serves as both a natural cosmetic pigment (lip balms, blush) and a health supplement for stamina and blood health.',
  299.00, 399.00, '100 gm', 100, true, false,
  'a1000000-0000-0000-0000-000000000003',
  ARRAY['beetroot', 'natural pigment', 'lip tint', 'health supplement'],
  ARRAY['Natural cosmetic pigment', 'Rich in iron and folate', 'Boosts stamina', 'Improves blood health', 'Antioxidant-rich'],
  ARRAY['Pure Beta Vulgaris (Beetroot) Powder']
)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- END OF SCHEMA
-- ─────────────────────────────────────────────────────────────
-- To verify: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
