import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

// Supabase Direct Postgres Connection
const client = new Client({
  host: 'db.evbuchyepfjaxkeekxdm.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Shyama@8209043112',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log('Connecting to Supabase PostgreSQL...');
  try {
    await client.connect();
    console.log('Connected successfully to Supabase PostgreSQL!');

    const sqlPath = path.join(__dirname, 'supabase-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing supabase-schema.sql...');
    await client.query(sql);
    console.log('Schema executed successfully!');

    // Check products
    const res = await client.query('SELECT count(*) FROM public.products;');
    console.log(`Total products in database: ${res.rows[0].count}`);

    const prodNames = await client.query('SELECT name, price, pack_size FROM public.products LIMIT 5;');
    console.log('Sample products:', prodNames.rows);

  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
