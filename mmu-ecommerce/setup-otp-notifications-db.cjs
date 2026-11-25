const pg = require('pg');
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
  console.log('Connecting to Supabase PostgreSQL database...');
  await client.connect();
  console.log('Connected!');

  const sql = `
    CREATE TABLE IF NOT EXISTS public.email_otps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL,
      otp TEXT NOT NULL,
      purpose TEXT NOT NULL DEFAULT 'signin',
      expires_at TIMESTAMPTZ NOT NULL,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_email_otps_email ON public.email_otps (email);

    CREATE TABLE IF NOT EXISTS public.notification_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      recipient_email TEXT NOT NULL,
      recipient_phone TEXT,
      template_name TEXT,
      template_title TEXT,
      subject TEXT,
      body TEXT,
      order_id TEXT,
      payment_id TEXT,
      status TEXT DEFAULT 'sent',
      channel TEXT DEFAULT 'email',
      error_message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs (created_at DESC);

    ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_otps' AND policyname = 'Allow public otps') THEN
        CREATE POLICY "Allow public otps" ON public.email_otps FOR ALL TO public USING (true) WITH CHECK (true);
      END IF;
    END $$;

    ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_logs' AND policyname = 'Allow public notification_logs') THEN
        CREATE POLICY "Allow public notification_logs" ON public.notification_logs FOR ALL TO public USING (true) WITH CHECK (true);
      END IF;
    END $$;
  `;

  await client.query(sql);
  console.log('Schema executed successfully!');

  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('email_otps', 'notification_logs');
  `);
  console.log('Verified created tables in Supabase:', res.rows.map(r => r.table_name));

  await client.end();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
