-- ============================================================
-- MMU Reviews RLS (Row Level Security) Policies
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Enable RLS on the reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
-- 2. PUBLIC SELECT — anyone can read approved reviews
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;
CREATE POLICY "reviews_public_read"
  ON public.reviews
  FOR SELECT
  USING (is_approved = true);

-- ──────────────────────────────────────────────
-- 3. INSERT — anyone (including anonymous) can submit a review
--    It starts unapproved; admin moderates before it goes live.
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "reviews_anyone_insert" ON public.reviews;
CREATE POLICY "reviews_anyone_insert"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    -- Force new reviews to start unapproved — no one can self-approve
    is_approved = false
    AND is_featured = false
  );

-- ──────────────────────────────────────────────
-- 4. UPDATE own review (logged-in customer only, unapproved only)
--    A customer can edit/withdraw their own review before admin approves it.
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "reviews_owner_update" ON public.reviews;
CREATE POLICY "reviews_owner_update"
  ON public.reviews
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND is_approved = false       -- cannot edit once approved
  )
  WITH CHECK (
    is_approved = false           -- cannot approve own review
    AND is_featured = false       -- cannot self-feature
    AND user_id = auth.uid()
  );

-- ──────────────────────────────────────────────
-- 5. DELETE own unapproved review (logged-in customer only)
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "reviews_owner_delete" ON public.reviews;
CREATE POLICY "reviews_owner_delete"
  ON public.reviews
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND is_approved = false       -- cannot delete once approved (contact admin)
  );

-- ──────────────────────────────────────────────
-- 6. ADMIN full access — admin can SELECT, UPDATE, DELETE all reviews
--    Uses Supabase custom claims: profiles.role = 'admin'
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "reviews_admin_all" ON public.reviews;
CREATE POLICY "reviews_admin_all"
  ON public.reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ──────────────────────────────────────────────
-- 7. Ensure the user_id column exists on reviews
--    (safe to run even if column already exists)
-- ──────────────────────────────────────────────
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Optional: index for fast per-user queries
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS reviews_is_approved_idx ON public.reviews (is_approved);
CREATE INDEX IF NOT EXISTS reviews_is_featured_idx ON public.reviews (is_featured);

-- ──────────────────────────────────────────────
-- 8. Profiles RLS (customers see only their own row; admin sees all)
-- ──────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
CREATE POLICY "profiles_self_read"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    -- prevents user from changing their own role
  );

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all"
  ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.id = auth.uid() AND p2.role = 'admin'
    )
  );

-- Done! ✅
-- After running, verify in Supabase → Authentication → Policies
