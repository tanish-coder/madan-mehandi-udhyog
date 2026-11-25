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
  const uid = 'e8cb43aa-1a96-4310-a2f8-7ddbb3d94e56';
  const email = 'admin@madanmehandi.com';

  // Check identities
  const idCheck = await client.query('SELECT * FROM auth.identities WHERE user_id = $1::uuid', [uid]);
  if (idCheck.rows.length === 0) {
    const identityData = JSON.stringify({ sub: uid, email: email });
    await client.query(`
      INSERT INTO auth.identities (
        id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        $1::text,
        $2::uuid,
        $3::jsonb,
        'email',
        now(),
        now(),
        now()
      )
    `, [uid, uid, identityData]);
    console.log('Inserted identity');
  }

  // Upsert profile with role = 'admin'
  await client.query(`
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES ($1::uuid, $2::text, 'MMU Administrator', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'MMU Administrator';
  `, [uid, email]);

  const p = await client.query('SELECT * FROM public.profiles WHERE id = $1::uuid', [uid]);
  console.log('Admin profile verified:', p.rows[0]);

  const prods = await client.query('SELECT count(*) FROM public.products');
  console.log('Products count in database:', prods.rows[0].count);

  await client.end();
}

run().catch(console.error);
