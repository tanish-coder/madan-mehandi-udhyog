const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Shyama@8209043112@db.evbuchyepfjaxkeekxdm.supabase.co:5432/postgres',
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase Postgres');

  // Create public bucket for product media
  await client.query(`
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('mmu-media', 'mmu-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'])
    ON CONFLICT (id) DO UPDATE SET public = true;
  `);

  // Set up storage policy for public read and authenticated/anon upload
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access MMU Media'
      ) THEN
        CREATE POLICY "Public Access MMU Media" ON storage.objects FOR SELECT USING (bucket_id = 'mmu-media');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Uploads MMU Media'
      ) THEN
        CREATE POLICY "Allow Uploads MMU Media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mmu-media');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Update MMU Media'
      ) THEN
        CREATE POLICY "Allow Update MMU Media" ON storage.objects FOR UPDATE USING (bucket_id = 'mmu-media');
      END IF;
    END $$;
  `);

  console.log('Successfully set up mmu-media bucket and storage policies!');
  await client.end();
}

run().catch((e) => {
  console.error(e);
  client.end();
});
