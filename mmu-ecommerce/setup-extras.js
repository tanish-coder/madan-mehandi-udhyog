import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: 'db.evbuchyepfjaxkeekxdm.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Shyama@8209043112',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  // Create settings table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key TEXT NOT NULL UNIQUE,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Settings viewable by all" ON public.settings;
    CREATE POLICY "Settings viewable by all" ON public.settings FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Settings manage" ON public.settings;
    CREATE POLICY "Settings manage" ON public.settings FOR ALL USING (true);
  `);

  // Insert initial settings
  await client.query(`
    INSERT INTO public.settings (key, value)
    VALUES 
      ('business_info', '{
        "name": "Madan Mehandi Udhyog (MMU)",
        "tagline": "Pure Sojat Henna. Trusted Worldwide.",
        "address": "Industrial Area, 3rd Phase, Sojat City, Rajasthan 306104, India",
        "phone": "+91 94141 12345",
        "email": "contact@madanmehandi.com",
        "whatsapp": "+91 94141 12345",
        "google_reviews_url": "https://maps.google.com/?q=Sojat+City+Rajasthan",
        "google_maps_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57500!2d73.66!3d25.92!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x394200c5c8e3cf3b%3A0xb35a7be3c41!2sSojat%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1",
        "facebook": "https://facebook.com/madanmehandi",
        "instagram": "https://instagram.com/madanmehandi",
        "youtube": "https://youtube.com/@madanmehandi"
      }'::jsonb),
      ('shipping_settings', '{
        "base_shipping": 50,
        "free_shipping_threshold": 999,
        "gst_rate": 5,
        "min_order_amount": 299,
        "cod_enabled": true,
        "online_payment_enabled": true
      }'::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
  `);

  console.log('Settings table and seed values verified.');

  // Let's also check if we can create a default admin user or if there are existing users in auth.users
  const usersRes = await client.query('SELECT id, email FROM auth.users;');
  console.log('Existing users in auth.users:', usersRes.rows);

  await client.end();
}

run().catch(console.error);
