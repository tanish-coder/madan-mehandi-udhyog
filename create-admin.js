import pg from 'pg';
import crypto from 'crypto';

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

  const adminEmail = 'rs5621614@gmail.com';
  const adminPassword = 'Ravi@12345';
  const userId = crypto.randomUUID();

  console.log(`Checking if admin user ${adminEmail} exists...`);
  const check = await client.query('SELECT id FROM auth.users WHERE email = $1', [adminEmail]);

  if (check.rows.length === 0) {
    console.log('Creating admin user in auth.users and public.profiles...');
    
    // Insert into auth.users using pgcrypto crypt
    await client.query(`
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        $1,
        'authenticated',
        'authenticated',
        $2,
        crypt($3, gen_salt('bf')),
        now(),
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"MMU Admin","role":"admin"}',
        FALSE,
        now(),
        now(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        FALSE,
        NULL
      )
    `, [userId, adminEmail, adminPassword]);

    // Insert into auth.identities so Supabase Auth recognises the email provider login
    await client.query(`
      INSERT INTO auth.identities (
        id,
        provider_id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        $1::uuid,
        $1::text,
        $1::uuid,
        jsonb_build_object('sub', $1::text, 'email', $2::text),
        'email',
        now(),
        now(),
        now()
      )
      ON CONFLICT DO NOTHING
    `, [userId, adminEmail]);

    // Ensure profile exists and has role='admin'
    await client.query(`
      INSERT INTO public.profiles (id, email, full_name, role)
      VALUES ($1, $2, 'MMU Admin', 'admin')
      ON CONFLICT (id) DO UPDATE
      SET role = 'admin', email = $2, full_name = 'MMU Admin';
    `, [userId, adminEmail]);

    console.log('Admin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  } else {
    const existingId = check.rows[0].id;
    console.log(`Admin user already exists with id: ${existingId}. Updating password & role...`);
    await client.query(`
      UPDATE auth.users 
      SET encrypted_password = crypt($1, gen_salt('bf')), email_confirmed_at = now()
      WHERE id = $2
    `, [adminPassword, existingId]);

    await client.query(`
      INSERT INTO auth.identities (
        id,
        provider_id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        $1::uuid,
        $1::text,
        $1::uuid,
        jsonb_build_object('sub', $1::text, 'email', $2::text),
        'email',
        now(),
        now(),
        now()
      )
      ON CONFLICT DO NOTHING
    `, [existingId, adminEmail]);

    await client.query(`
      INSERT INTO public.profiles (id, email, full_name, role)
      VALUES ($1, $2, 'MMU Admin', 'admin')
      ON CONFLICT (id) DO UPDATE SET role = 'admin', email = $2, full_name = 'MMU Admin';
    `, [existingId, adminEmail]);
    console.log('Admin updated with password: ' + adminPassword);
  }

  await client.end();
  process.exit(0);
}

run().catch(async (err) => {
  console.error(err);
  try { await client.end(); } catch (_) {}
  process.exit(1);
});
