# Madan Mehandi Udhyog (MMU) — Website Project Requirements

## 1. Business Overview

- **Business / Website Name:** Madan Mehandi Udhyog (MMU)
- **Business Type:** Worldwide wholesale and e-commerce supplier of henna powder and Ayurvedic/natural ingredient powders.
- **Business Address:** Industrial Area, 3rd Phase, Sojat City, Rajasthan, India.
- **Brand Heritage:** The website must clearly communicate that **Sojat is famous for mehndi (henna)** and present MMU as a business bringing Sojat's henna heritage to customers and businesses worldwide.

## 2. Technology Stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js (recommended API framework)

### Database and Authentication
- Supabase PostgreSQL
- Supabase Auth for customer/admin authentication and sessions

### File and Media Storage
- Cloudflare R2 for product photos, videos, packaging images, review media and other uploaded assets.
- Store object keys and public/delivery URLs or references in Supabase, rather than storing image/video binaries in database rows.
- Use a secure Node.js backend to issue short-lived presigned upload URLs or handle authorized upload workflows. Keep R2 credentials on the server only.

## 3. Main Business Goals

Build a premium, creative, high-performance, responsive worldwide e-commerce website that:
- Presents MMU as a trusted henna and natural Ayurvedic ingredient supplier.
- Supports retail buying and wholesale enquiries.
- Allows customers to browse products, add items to cart and place orders.
- Allows customers to enquire about products and bulk requirements.
- Offers third-party/private-label manufacturing so customers can start their own brands.
- Provides separate customer and admin login experiences.
- Shows genuine customer reviews in an animated sliding carousel.
- Includes the business location map and a Google rating/reviews link.
- Uses product photos and videos supplied by the business.
- Provides an advanced visual experience with smooth animations, effects and transitions.

## 4. Product Catalogue and Pricing

All products currently have the same listed price: **₹299 per 100 gm**.

| # | Product | Price | Listed Pack |
|---:|---|---:|---:|
| 1 | Henna Powder | ₹299 | 100 gm |
| 2 | 3 Filter Henna Powder | ₹299 | 100 gm |
| 3 | Herbal Henna Powder | ₹299 | 100 gm |
| 4 | Organic Henna Powder | ₹299 | 100 gm |
| 5 | Indigo Powder | ₹299 | 100 gm |
| 6 | Moringa Powder | ₹299 | 100 gm |
| 7 | Multani Mitti Powder | ₹299 | 100 gm |
| 8 | Neem Powder | ₹299 | 100 gm |
| 9 | Amla Powder | ₹299 | 100 gm |
| 10 | Shikakai Powder | ₹299 | 100 gm |
| 11 | Reetha Powder | ₹299 | 100 gm |
| 12 | Hibiscus Powder | ₹299 | 100 gm |
| 13 | Orange Powder | ₹299 | 100 gm |
| 14 | Rose Powder | ₹299 | 100 gm |
| 15 | Beetroot Powder | ₹299 | 100 gm |

Prices, pack sizes, availability and shipping charges should be editable by an authorized admin. Do not hard-code the price throughout the UI.

## 5. User Roles and Authentication

### Customer
Customers should be able to:
- Register, log in and log out.
- Browse/search/filter products.
- View product details and product images.
- Add products to cart and update quantities.
- Place orders and view order history/status.
- Submit product and bulk enquiries.
- Submit private-label/third-party manufacturing enquiries.
- Manage their profile and addresses.
- Submit reviews after purchase or when permitted by business policy.

### Admin
Admins should be able to:
- Log in through a protected admin route.
- Manage products, prices, stock/availability and product media.
- View and update orders.
- View and respond to customer enquiries.
- Manage private-label manufacturing enquiries.
- Moderate customer reviews.
- Manage customer accounts/roles where permitted.
- Update business details and website links.

**Security requirement:** Use Supabase Auth and role-based authorization. Admin permissions must be verified server-side; hiding admin UI in React is not security. Never trust a role supplied by the browser.

## 6. Required Website Pages / Routes

### Public routes
- `/` — Home
- `/about` — About MMU and Sojat mehndi heritage
- `/products` — Product catalogue
- `/products/:slug` — Product details
- `/wholesale` — Worldwide wholesale information
- `/manufacturing` — Third-party/private-label manufacturing
- `/enquiry` — General enquiry form
- `/reviews` — Customer reviews
- `/contact` — Contact details, map and Google rating link

### Authentication routes
- `/login` — Customer/admin login selection or role-aware login
- `/register` — Customer registration
- `/forgot-password` — Password recovery

### Customer protected routes
- `/account` — Customer dashboard
- `/account/profile` — Customer profile
- `/account/orders` — Order history
- `/account/orders/:id` — Order details
- `/account/enquiries` — Customer enquiries
- `/account/manufacturing-enquiries` — Manufacturing enquiries
- `/cart` — Shopping cart
- `/checkout` — Checkout

### Admin protected routes
- `/admin` — Admin dashboard
- `/admin/products` — Product management
- `/admin/products/new` — Add product
- `/admin/products/:id/edit` — Edit product
- `/admin/orders` — Order management
- `/admin/enquiries` — General enquiries
- `/admin/manufacturing` — Manufacturing enquiries
- `/admin/reviews` — Review moderation
- `/admin/customers` — Customer management
- `/admin/settings` — Website/business settings

## 7. Homepage Content and Sections

1. Premium navigation bar with MMU logo, page links, cart and login.
2. Hero section with premium supplied product/factory image or video.
3. Main headline, e.g. **“Pure Sojat Henna. Trusted Worldwide.”**
4. CTA buttons: Shop Products, Wholesale Enquiry, Start Your Brand.
5. Sojat heritage section: explain that Sojat is famous for mehndi.
6. Featured products with images and prices.
7. Why Choose MMU section.
8. Worldwide wholesale supply section.
9. Third-party/private-label manufacturing section.
10. How the manufacturing process works.
11. Customer reviews in a smoothly auto-sliding carousel.
12. Google rating/reviews CTA.
13. Location/map section.
14. Enquiry/newsletter CTA as appropriate.
15. Comprehensive footer with address, contact and social links.

## 8. E-commerce Buying Features

- Product listing and product detail pages.
- Product image gallery.
- Search, category filters and sorting.
- Pack size/quantity selection where supported.
- Cart with quantity updates and item removal.
- Checkout with customer details and delivery address.
- Shipping/tax calculation based on configured business rules.
- Order confirmation and customer order history.
- Payment gateway integration to be selected before production.
- Order status management in admin.
- Clear policies for shipping, returns, cancellations and privacy.

Do not claim payment processing is live until a payment provider is integrated and tested.

## 9. Enquiry Features

Provide enquiry CTAs throughout the website and forms with:
- Full name
- Email
- Phone/WhatsApp
- Country
- Product/service of interest
- Required quantity
- Message

Store submissions in Supabase through validated backend API endpoints. Show clear success and error feedback.

## 10. Third-Party / Private-Label Manufacturing

Prominent page headline: **“Start Your Own Natural Product Brand with MMU.”**

Explain that interested businesses can enquire about third-party manufacturing and private-label services.

Suggested form fields:
- Name
- Company name
- Email
- Phone/WhatsApp
- Country
- Brand name
- Product(s) required
- Estimated quantity
- Packaging requirements
- Additional message

Suggested process:
1. Share requirements.
2. Select products.
3. Discuss branding and packaging.
4. Confirm manufacturing details.
5. Proceed with the agreed order.

Only advertise manufacturing capabilities, certifications, minimum quantities and lead times that MMU has verified.

## 11. Reviews, Google Rating and Map

### Reviews
- Display genuine customer feedback.
- Use an animated horizontal carousel/slider.
- Pause animation on hover/focus.
- Support touch/swipe on mobile.
- Include customer name, country, rating and review.
- Admin moderation before public display.

Do not publish fabricated testimonials or invented customer ratings.

### Google
- Add a configurable Google Business Profile reviews/rating URL.
- Use a real verified Google link supplied by the business.

### Map
- Embed a map pointing to the business location.
- Display: Industrial Area, 3rd Phase, Sojat City, Rajasthan, India.
- Add a directions link.
- Confirm the exact map pin before launch.

## 12. Design and Animation Direction

Visual direction:
- Premium, elegant, natural, modern and international.
- Henna-inspired patterns and earthy textures.
- Rich product photography and optional brand videos.
- High-quality typography and generous whitespace.

Animation ideas:
- Smooth page/route transitions.
- Scroll-triggered reveal animations.
- Parallax imagery.
- Animated hero typography.
- Floating decorative elements.
- Product image zoom and card hover effects.
- Smooth button micro-interactions.
- Animated review carousel.
- Subtle background motion and loading states.

Accessibility and performance:
- Respect `prefers-reduced-motion`.
- Avoid excessive motion and layout shifts.
- Optimize and lazy-load images/videos.
- Use responsive image sizes and compressed media.
- Ensure keyboard navigation and visible focus states.
- Test mobile, tablet and desktop layouts.

## 13. Suggested Frontend Project Structure

```text
mmu-ecommerce/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── assets/
│       │   ├── images/
│       │   └── videos/
│       ├── components/
│       │   ├── layout/
│       │   ├── ui/
│       │   ├── products/
│       │   ├── reviews/
│       │   └── forms/
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── About.tsx
│       │   ├── Products.tsx
│       │   ├── ProductDetails.tsx
│       │   ├── Wholesale.tsx
│       │   ├── Manufacturing.tsx
│       │   ├── Enquiry.tsx
│       │   ├── Reviews.tsx
│       │   ├── Contact.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Cart.tsx
│       │   ├── Checkout.tsx
│       │   ├── customer/
│       │   └── admin/
│       ├── hooks/
│       ├── context/
│       ├── lib/
│       │   └── supabase.ts
│       ├── services/
│       ├── types/
│       └── utils/
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts
│       ├── config/
│       │   ├── supabase.ts
│       │   └── r2.ts
│       ├── routes/
│       ├── controllers/
│       ├── middleware/
│       ├── services/
│       ├── validators/
│       └── types/
│
├── .gitignore
└── README.md
```

## 14. Suggested Supabase Database Tables

- `profiles` — customer profile and role reference
- `products` — product details, price, pack size, stock and active status
- `product_images` — product image/video object keys and display order
- `categories` — product categories
- `carts` / `cart_items` — persistent carts if required
- `orders` — customer orders, totals and status
- `order_items` — products, quantities and price snapshots
- `addresses` — customer delivery addresses
- `enquiries` — general and wholesale enquiries
- `manufacturing_enquiries` — private-label requests
- `reviews` — customer feedback and moderation status

Use Supabase Row Level Security (RLS) policies for customer-owned records and role-restricted admin access. Keep sensitive authorization and business operations on the backend where appropriate.

## 15. Cloudflare R2 Storage

Use R2 for:
- Product images
- Product galleries
- Brand and factory photos
- Promotional videos
- Customer review media, if enabled
- Packaging and catalogue assets

Recommended approach:
1. Frontend requests an upload authorization from Node.js.
2. Backend verifies the user and requested object.
3. Backend creates a short-lived presigned R2 upload URL.
4. Browser uploads the file directly to R2.
5. Backend/database stores the object key and metadata in Supabase.

Never expose R2 access keys or secret credentials in frontend code. Validate file type, size, ownership and upload permissions.

## 16. Node.js Backend Responsibilities

- Authentication/session verification using Supabase Auth.
- Server-side role and permission checks.
- Product and category APIs.
- Cart and order APIs.
- Enquiry and manufacturing enquiry APIs.
- Review submission/moderation APIs.
- R2 presigned upload URL generation.
- Payment provider integration and verified payment webhooks.
- Input validation, rate limiting, logging and secure error handling.

## 17. Brand Message

> Madan Mehandi Udhyog (MMU) brings the heritage of Sojat — famous for its mehndi — to customers and businesses worldwide with henna powder and natural Ayurvedic ingredient products, wholesale supply and private-label manufacturing opportunities.

## 18. Development Priorities

1. Set up React + Vite + TypeScript + Tailwind.
2. Build responsive public pages and premium visual design.
3. Integrate supplied photos/videos through reusable media components.
4. Build product catalogue, details, cart and checkout UI.
5. Set up Supabase schema, authentication and RLS.
6. Build Node.js API and connect frontend services.
7. Configure Cloudflare R2 uploads and media delivery.
8. Build customer account and admin dashboard.
9. Implement enquiries, manufacturing requests and review moderation.
10. Integrate payment/shipping providers and test end-to-end.
11. Perform accessibility, security, performance and mobile testing.

---

## Project Summary

- **Brand:** Madan Mehandi Udhyog (MMU)
- **Address:** Industrial Area, 3rd Phase, Sojat City, Rajasthan, India
- **Business:** Worldwide henna and Ayurvedic ingredient wholesale + e-commerce
- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** Node.js / Express.js
- **Database/Auth:** Supabase
- **Object Storage:** Cloudflare R2
- **Product Range:** 15 listed products
- **Current Listed Price:** ₹299 per 100 gm for every listed product
- **Required Features:** Customer/admin login, shopping/buying, cart, checkout, enquiries, third-party/private-label manufacturing, animated reviews, Google rating link, map, supplied product photos/videos, premium animations and responsive design.
