# Madan Mehandi Udhyog (MMU) — Worldwide Henna E-Commerce & Admin Platform

**Madan Mehandi Udhyog (MMU)** brings the rich heritage of Sojat City, Rajasthan — the world capital of henna — to retail connoisseurs and wholesale enterprises worldwide.

---

## 🏛️ Business Overview

- **Brand:** Madan Mehandi Udhyog (MMU)
- **Headquarters & Factory:** Industrial Area, 3rd Phase, Sojat City, Rajasthan 306104, India
- **Specialization:** Pure Lawsonia Inermis Sojat Henna Powder, Triple-Sifted Bridal Henna, Herbal Henna Blends, Natural Ayurvedic Powders (Indigo, Moringa, Multani Mitti, Amla, Shikakai, Reetha, Hibiscus, Rose, Orange, Beetroot), Worldwide Wholesale Exports, and Third-Party Private-Label Contract Manufacturing.
- **Catalogue:** 15 Flagship Botanical Powders
- **Base Pricing:** ₹299.00 per 100 gm (fully configurable in Admin Panel)

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + TypeScript + Vite |
| **Styling & Design System** | Tailwind CSS (Custom Henna & Earth palette: `#c06720`, `#833f1e`) |
| **State & Cache Management** | TanStack React Query + React Context |
| **Icons & Micro-interactions**| Lucide React |
| **Database & Authentication** | Supabase PostgreSQL with Row Level Security (RLS) & Supabase Auth |
| **Direct DB Management** | PostgreSQL Direct Client (`pg`) |
| **File / Media Storage** | Cloudflare R2 (Architecture prepared with presigned URL service) |

---

## 🗄️ Database Architecture (Live Supabase)

The live Supabase instance is connected and seeded at:
- **Supabase URL:** `https://evbuchyepfjaxkeekxdm.supabase.co`
- **Schema File:** [`supabase-schema.sql`](file:///c:/Users/Tanish%20Lohiya/OneDrive/Desktop/madan%20mehandi%20udhyog/mmu-ecommerce/supabase-schema.sql)

### Tables in Production:
1. `profiles` — User profile, contact, and authorization roles (`customer` | `admin`).
2. `categories` — Product categories (`Henna Powders`, `Herbal Powders`, `Hair Care`, `Skin & Beauty Care`).
3. `products` — Complete inventory of 15 MMU products with price, pack size, stock, benefits, ingredients, and active/featured toggles.
4. `product_images` — Image gallery keys, display orders, and primary flags.
5. `addresses` — Customer delivery addresses and postal details.
6. `orders` — Customer orders, subtotals, fulfillment status, and payment tracking.
7. `order_items` — Snapshot line items per order.
8. `enquiries` — Retail & wholesale customer enquiries with admin response tracking.
9. `manufacturing_enquiries` — Third-party contract manufacturing & private-label brand requests.
10. `reviews` — Customer ratings, verified feedback, and admin moderation workflow.
11. `settings` — Corporate address, Sojat map embeds, shipping thresholds, and payment modes.

---

## 🔐 Administrator Access

An administrator account has been created and verified in Supabase:

- **Login URL:** [`http://localhost:5173/login`](http://localhost:5173/login)
- **Admin Email:** `admin@madanmehandi.com`
- **Admin Password:** `AdminPassword@123`
- *(A one-click "Autofill" button is available on the login page for instant access)*

---

## 🚀 Running the Project

### Prerequisites
- Node.js 18+ (tested on Node v24.18.0)
- npm 10+

### Installation & Development
```bash
cd mmu-ecommerce
npm install
npm run dev
```

Visit [`http://localhost:5173/admin`](http://localhost:5173/admin) to access the complete Admin Panel.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🌟 Admin Panel Features

- **Dashboard:** Real-time counters for Products, Orders, Enquiries, and Registered Customers with recent orders table.
- **Product Catalogue:** Full CRUD for all 15 MMU botanical products, search by keyword/tag, filter by category/stock, toggle active/featured, and edit pricing.
- **Order Management:** Filter by fulfillment status (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`), view items breakdown, print invoices, and update courier tracking notes.
- **Enquiries & Leads:** Manage wholesale export requests and retail questions with email quick-actions and note logging.
- **Private Label / Manufacturing:** Dedicated pipeline for third-party brand creation, MOQs, packaging specs, and production contracts.
- **Customer Reviews Moderation:** Approve/reject customer reviews, feature genuine feedback on homepage slider.
- **Customer Management:** View profiles, inspect order histories, and safely promote/demote administrator roles.
- **Platform Settings:** Update business address, phone, WhatsApp, Google Business rating URL, and interactive Sojat map embed.
