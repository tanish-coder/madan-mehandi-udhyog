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
  const adminId = 'e8cb43aa-1a96-4310-a2f8-7ddbb3d94e56';

  // Check if enquiries exist
  const enqCheck = await client.query('SELECT count(*) FROM public.enquiries');
  if (parseInt(enqCheck.rows[0].count) === 0) {
    console.log('Seeding enquiries...');
    await client.query(`
      INSERT INTO public.enquiries (full_name, email, phone, country, product_interest, quantity_required, message, type, status)
      VALUES 
        ('Amit Singhania', 'amit.singhania@delhiherbal.com', '+91 98234 56789', 'India', 'Henna Powder & Indigo Powder', '500 kg', 'Looking for monthly bulk supply of pure Sojat henna and indigo powder for our salon franchise.', 'wholesale', 'new'),
        ('Elena Rostova', 'elena@moscowbeauty.ru', '+7 916 123 4567', 'Russia', '3 Filter Henna Powder', '100 kg', 'We need micro-filtered henna suitable for cone preparation in our beauty studio chain.', 'wholesale', 'read'),
        ('Kavita Sharma', 'kavita.s@gmail.com', '+91 99887 76655', 'India', 'Rose Powder & Multani Mitti', '5 kg', 'Need pure rose petal powder and multani mitti for personal DIY skincare brand.', 'general', 'replied'),
        ('Mohammed Al-Otaibi', 'm.otaibi@riyadhnatural.sa', '+966 50 123 4567', 'Saudi Arabia', 'Organic Henna Powder', '2 Tonnes', 'Requesting export pricing CIF Jeddah for certified organic Sojat henna powder in bulk bags.', 'wholesale', 'new'),
        ('Sarah Jenkins', 'sarah@organicsalon.co.uk', '+44 7700 900123', 'United Kingdom', 'Amla, Shikakai & Reetha Powder', '250 kg', 'Interested in wholesale packs of traditional hair washing trio for retail distribution in UK.', 'wholesale', 'new');
    `);
  }

  // Check if manufacturing enquiries exist
  const mfgCheck = await client.query('SELECT count(*) FROM public.manufacturing_enquiries');
  if (parseInt(mfgCheck.rows[0].count) === 0) {
    console.log('Seeding manufacturing enquiries...');
    await client.query(`
      INSERT INTO public.manufacturing_enquiries (name, company_name, email, phone, country, brand_name, products_required, estimated_quantity, packaging_requirements, message, status)
      VALUES 
        ('Vikramaditya Roy', 'Aura Botanica Pvt Ltd', 'vikram@aurabotanica.in', '+91 98765 43210', 'India', 'Aura Pure', 'Henna Powder, Indigo Powder, Beetroot Powder', '5,000 retail pouches / month', 'Stand-up zipper pouches with custom matte foil printing (100g & 250g)', 'We are launching a premium direct-to-consumer Ayurvedic hair color brand. Seeking third-party contract manufacturing partner with private label packaging.', 'reviewing'),
        ('Fatima Noor', 'Gulf Naturals FZE', 'fatima.noor@gulfnaturals.ae', '+971 4 234 5678', 'UAE', 'Noor Henna', '3 Filter Henna & Herbal Henna', '10,000 units / quarter', 'Printed aluminum tubes / pre-filled cones and 100g luxury tins', 'Private label manufacturing enquiry for Middle East distribution. Need lab certificates and phytosanitary certificates.', 'quoted'),
        ('Thomas Becker', 'BioKräuter GmbH', 't.becker@biokraeuter.de', '+49 30 1234 5678', 'Germany', 'NaturHaar', 'Certified Organic Henna & Moringa Powder', '1 Tonne / batch', 'Eco-friendly biodegradable craft paper pouches with German labeling', 'Looking for ISO/GMP compliant contract manufacturer for private label natural hair dyes in EU market.', 'new');
    `);
  }

  // Check if orders exist
  const ordersCheck = await client.query('SELECT count(*) FROM public.orders');
  if (parseInt(ordersCheck.rows[0].count) === 0) {
    console.log('Seeding orders...');
    // Fetch some product IDs
    const p1 = (await client.query("SELECT id, name, price, pack_size FROM public.products WHERE slug = 'henna-powder'")).rows[0];
    const p2 = (await client.query("SELECT id, name, price, pack_size FROM public.products WHERE slug = 'indigo-powder'")).rows[0];
    const p3 = (await client.query("SELECT id, name, price, pack_size FROM public.products WHERE slug = '3-filter-henna-powder'")).rows[0];

    const o1 = await client.query(`
      INSERT INTO public.orders (
        user_id, status, total_amount, subtotal, shipping_amount, tax_amount,
        shipping_address, payment_status, payment_method, notes
      ) VALUES (
        $1, 'confirmed', 598.00, 598.00, 0.00, 0.00,
        '{"full_name":"Rahul Mehra","phone":"+91 98112 23344","line1":"Flat 402, Green Valley Apts","line2":"Sector 14","city":"Jaipur","state":"Rajasthan","postal_code":"302001","country":"India"}'::jsonb,
        'paid', 'Online UPI', 'Express delivery requested'
      ) RETURNING id;
    `, [adminId]);

    const order1Id = o1.rows[0].id;
    await client.query(`
      INSERT INTO public.order_items (order_id, product_id, product_name, price_snapshot, quantity, pack_size, subtotal)
      VALUES 
        ($1, $2, $3, 299.00, 1, '100 gm', 299.00),
        ($1, $4, $5, 299.00, 1, '100 gm', 299.00);
    `, [order1Id, p1.id, p1.name, p2.id, p2.name]);

    const o2 = await client.query(`
      INSERT INTO public.orders (
        user_id, status, total_amount, subtotal, shipping_amount, tax_amount,
        shipping_address, payment_status, payment_method, notes
      ) VALUES (
        $1, 'processing', 897.00, 897.00, 0.00, 0.00,
        '{"full_name":"Meenakshi Sundaram","phone":"+91 94440 12345","line1":"12, Temple Road","line2":"Mylapore","city":"Chennai","state":"Tamil Nadu","postal_code":"600004","country":"India"}'::jsonb,
        'paid', 'Credit Card', 'Customer ordered 3 Filter Henna for bridal season'
      ) RETURNING id;
    `, [adminId]);

    const order2Id = o2.rows[0].id;
    await client.query(`
      INSERT INTO public.order_items (order_id, product_id, product_name, price_snapshot, quantity, pack_size, subtotal)
      VALUES 
        ($1, $2, $3, 299.00, 3, '100 gm', 897.00);
    `, [order2Id, p3.id, p3.name]);

    const o3 = await client.query(`
      INSERT INTO public.orders (
        user_id, status, total_amount, subtotal, shipping_amount, tax_amount,
        shipping_address, payment_status, payment_method, notes
      ) VALUES (
        $1, 'shipped', 299.00, 299.00, 50.00, 0.00,
        '{"full_name":"Sunita Gupta","phone":"+91 98300 98765","line1":"58/2 Park Street","line2":null,"city":"Kolkata","state":"West Bengal","postal_code":"700016","country":"India"}'::jsonb,
        'paid', 'Net Banking', 'Tracking ID: DTDC-SOJ-88291'
      ) RETURNING id;
    `, [adminId]);

    const order3Id = o3.rows[0].id;
    await client.query(`
      INSERT INTO public.order_items (order_id, product_id, product_name, price_snapshot, quantity, pack_size, subtotal)
      VALUES 
        ($1, $2, $3, 299.00, 1, '100 gm', 299.00);
    `, [order3Id, p1.id, p1.name]);
  }

  console.log('Sample activity seeded successfully!');
  await client.end();
}

run().catch(console.error);
