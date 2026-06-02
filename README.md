# ShopNext

A modern ecommerce storefront built with [Next.js](https://nextjs.org) (App Router), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/).

## Features

- 🏠 **Landing page** with hero, featured products, and a promo banner
- 🛍️ **Product catalog** with client-side category filtering
- 🃏 **Reusable product cards** with ratings, badges, and pricing
- 🖼️ **Optimized images** via `next/image` (Unsplash remote patterns configured)
- 📱 **Responsive design** from mobile to desktop

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the store.

## Project Structure

```
app/
  layout.tsx        # Root layout with navbar + footer
  page.tsx          # Home page (hero, featured, promo)
  products/
    page.tsx        # Full catalog with category filter
components/
  Navbar.tsx        # Sticky top navigation with cart
  ProductCard.tsx   # Single product card
lib/
  products.ts       # Product data + category helpers
```

## Available Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Create an optimized production build |
| `npm run start` | Run the production build             |
| `npm run lint`  | Run ESLint                           |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Images:** Unsplash (placeholder product imagery)

## Deploy

The easiest way to deploy is with the [Vercel Platform](https://vercel.com/new). See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
