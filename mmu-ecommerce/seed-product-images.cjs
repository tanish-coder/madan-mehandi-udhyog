const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Shyama@8209043112@db.evbuchyepfjaxkeekxdm.supabase.co:5432/postgres',
});

const productImagesData = [
  {
    slug: 'henna-powder',
    primary: 'https://images.unsplash.com/photo-1608248597359-556391d84a7e?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    alt: 'Madan Mehandi Udhyog Pure Sojat Henna Powder',
  },
  {
    slug: '3-filter-henna-powder',
    primary: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    alt: 'MMU 3-Filter Silk Sifted Bridal Cone Henna Powder',
  },
  {
    slug: 'herbal-henna-powder',
    primary: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1512290900672-1f4165d448df?auto=format&fit=crop&w=800&q=80',
    alt: 'MMU Herbal Henna Powder with 9 Ayurvedic Botanicals',
  },
  {
    slug: 'organic-henna-powder',
    primary: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1608248597359-556391d84a7e?auto=format&fit=crop&w=800&q=80',
    alt: '100% Certified Organic Sojat Lawsonia Inermis Henna Powder',
  },
  {
    slug: 'indigo-powder',
    primary: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    alt: 'MMU Pure Organic Indigo Leaf Hair Dye Powder',
  },
  {
    slug: 'moringa-powder',
    primary: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1515544465487-75b877239768?auto=format&fit=crop&w=800&q=80',
    alt: 'MMU Emerald Green Moringa Oleifera Leaf Powder',
  },
  {
    slug: 'multani-mitti-powder',
    primary: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    alt: 'MMU Pure Rajasthani Multani Mitti Clay Powder',
  },
  {
    slug: 'neem-powder',
    primary: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1512290900672-1f4165d448df?auto=format&fit=crop&w=800&q=80',
    alt: 'MMU Organic Neem Leaf Scalp & Skin Powder',
  },
  {
    slug: 'amla-powder',
    primary: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    alt: 'MMU Indian Gooseberry Dried Amla Powder',
  },
  {
    slug: 'shikakai-powder',
    primary: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    alt: 'MMU Pure Acacia Concinna Shikakai Cleansing Powder',
  },
  {
    slug: 'reetha-powder',
    primary: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1512290900672-1f4165d448df?auto=format&fit=crop&w=800&q=80',
    alt: 'MMU Organic Soapnut Reetha Powder',
  },
  {
    slug: 'hibiscus-powder',
    primary: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    alt: 'MMU Dried Red Hibiscus Rosa-Sinensis Flower Powder',
  },
  {
    slug: 'orange-powder',
    primary: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80',
    alt: 'MMU Dried Orange Peel Skin Brightening Powder',
  },
  {
    slug: 'rose-powder',
    primary: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=800&q=80',
    alt: 'MMU Indian Damask Rose Petal Powder',
  },
  {
    slug: 'beetroot-powder',
    primary: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=800&q=80',
    secondary: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80',
    alt: 'MMU Dehydrated Red Beetroot Powder',
  },
];

async function seed() {
  await client.connect();
  console.log('Connected to Supabase Postgres...');

  // Clear existing product_images to avoid duplicates
  await client.query('DELETE FROM product_images;');

  for (const item of productImagesData) {
    // 1. Update product primary_image_url
    const res = await client.query(
      'UPDATE products SET primary_image_url = $1 WHERE slug = $2 RETURNING id, name;',
      [item.primary, item.slug]
    );

    if (res.rows.length > 0) {
      const prodId = res.rows[0].id;
      const prodName = res.rows[0].name;

      // 2. Insert primary image in product_images
      await client.query(
        `INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary)
         VALUES ($1, $2, $3, $4, $5);`,
        [prodId, item.primary, item.alt, 1, true]
      );

      // 3. Insert secondary image in product_images
      await client.query(
        `INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary)
         VALUES ($1, $2, $3, $4, $5);`,
        [prodId, item.secondary, `${item.alt} - Close Up Texture`, 2, false]
      );

      console.log(`Updated images for: ${prodName}`);
    } else {
      console.warn(`Product not found for slug: ${item.slug}`);
    }
  }

  console.log('Finished seeding product images successfully!');
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  client.end();
  process.exit(1);
});
