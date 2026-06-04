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
  cart/page.tsx     # Shopping cart
  checkout/         # Checkout, payment redirect, result page
  api/payment/      # SabPaisa initiate + callback routes
components/
  Navbar.tsx        # Sticky top navigation with cart
  ProductCard.tsx   # Single product card
lib/
  products.ts       # Product data + category helpers
  cart-context.tsx  # Cart state (localStorage-backed)
  currency.ts       # INR price formatting
  pricing.ts        # Authoritative totals + shipping rules
  orders.ts         # Pending-order store (server only)
  sabpaisa.ts       # Payment gateway helper (server only)
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

## Payments (SabPaisa)

Checkout is wired for the [SabPaisa](https://sabpaisa.in/) payment gateway using
the server-side encrypted-redirect flow. **Until credentials are added the app
runs in demo mode** (the checkout shows a confirmation without taking a payment).

> 📖 **New to payment integration?** See [PAYMENTS.md](PAYMENTS.md) for a tour of
> the common pain points and a **mock gateway** that runs the whole payment loop
> locally — no real credentials or public URL required.

### Setup

1. Copy the env template and fill in your SabPaisa credentials:
   ```bash
   cp .env.example .env.local
   ```
2. Set `SABPAISA_CLIENT_CODE`, `SABPAISA_USERNAME`, `SABPAISA_PASSWORD`,
   `SABPAISA_AUTH_KEY`, `SABPAISA_AUTH_IV`, and `SABPAISA_GATEWAY_URL`
   (start with the UAT/staging URL).
3. Restart `npm run dev`.

### Flow

| Step | Where | What happens |
| ---- | ----- | ------------ |
| 1 | `app/checkout/page.tsx` | POSTs cart line items (ids + quantities) to the initiate route |
| 2 | `app/api/payment/initiate/route.ts` | Recomputes the total server-side, records a pending order, AES-encrypts the request → `encData` |
| 3 | browser | Auto-submits `{ clientCode, encData }` to SabPaisa's hosted page |
| 4 | `app/api/payment/callback/route.ts` | Decrypts `encResponse`, reconciles against the pending order (status **and** amount), marks it paid/failed |
| 5 | `app/checkout/result/page.tsx` | Shows success/failure, clears cart on success |

Crypto + request/response building lives in `lib/sabpaisa.ts`; price calculation
in `lib/pricing.ts`; the pending-order store in `lib/orders.ts` (all server only).

The order total is computed **server-side from the product catalog** — the client
only sends ids and quantities, so a tampered price can't get through. The callback
also verifies the paid amount matches the recorded order.

> ⚠️ **Verify against your SabPaisa integration kit.** Field names, the exact
> gateway URL, response key names, and the encryption key size vary by version —
> these are marked with `TODO` / `NOTE` comments in the code.
>
> **Before production:** `lib/orders.ts` uses an in-memory store (lost on restart,
> not shared across serverless instances) — swap it for a real datastore.

## Deploy

The easiest way to deploy is with the [Vercel Platform](https://vercel.com/new). See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
