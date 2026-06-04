# Payment Gateway Integration — Pain Points & How This Repo Handles Them

A practical tour of what actually bites you when wiring up a payment gateway
(SabPaisa here, but the lessons apply to Razorpay, Stripe, PayU, etc.). Each
section: **the pain**, **where it shows up here**, and **what you still own**.

---

## Try it locally first (mock gateway)

You can run the *entire* payment loop with no real credentials and no public
URL, using the built-in mock gateway (`app/api/payment/mock-gateway/route.ts`).

1. Create `.env.local` with throwaway values and point the gateway URL at the mock:
   ```env
   SABPAISA_CLIENT_CODE=DEMO
   SABPAISA_USERNAME=demo
   SABPAISA_PASSWORD=demo
   SABPAISA_AUTH_KEY=1234567890123456      # 16 bytes -> AES-128
   SABPAISA_AUTH_IV=6543210987654321       # 16 bytes
   SABPAISA_GATEWAY_URL=http://localhost:3000/api/payment/mock-gateway
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```
2. `npm run dev`, add items, go to checkout, pay.
3. On the mock page: click **Success** (cart clears, order paid) or **Fail**.
   Try **editing the amount** before clicking Success to watch the callback
   reject it with `amount_mismatch` — that's pain point #5 in action.

Swap these for real SabPaisa values (and the real gateway URL) when you're ready.

---

## 1. You can't call the gateway from the browser

**Pain:** The encryption key / API secret must never reach the client. If you
build the payment request in React, anyone can read your secret in the bundle.

**Here:** Encryption and the secret live in `lib/sabpaisa.ts` and run only
inside the API routes (`app/api/payment/*`). The browser only ever sees the
already-encrypted `encData`.

**You own:** Keeping `lib/sabpaisa.ts` and `lib/orders.ts` server-only — never
import them into a client component.

## 2. Encryption mismatches (the #1 time-sink)

**Pain:** "It returns garbage." Almost always one of: wrong key length, wrong
IV, wrong padding (PKCS5/PKCS7), base64-vs-hex, or charset. The gateway docs
are often vague about which.

**Here:** `cipherFor()` picks AES-128/192/256 from the key's byte length;
`encrypt`/`decrypt` use CBC + base64. The mock gateway surfaces a clear
"could not decrypt — key/IV/padding mismatch" message so you can *see* it.

**You own:** Confirming SabPaisa's exact scheme against your kit. If decryption
fails with real creds, this is almost certainly why.

## 3. Field names & payload format drift

**Pain:** Required fields, their names, their order, and the amount format
(`100` vs `100.00` vs paise `10000`) differ between gateways *and between
versions of the same gateway*. One wrong field = a cryptic rejection.

**Here:** `buildRequestString()` and `parseResponseString()` in `lib/sabpaisa.ts`
have the field set marked with `NOTE:`/`TODO:` comments to verify.

**You own:** Matching every field name and the amount format to your kit.

## 4. The callback needs a reachable URL

**Pain:** The gateway redirects/POSTs back to your `callbackUrl`. On `localhost`
the *browser redirect* works (it's the user's browser POSTing), but any
**server-to-server webhook** can't reach `localhost` — you need a tunnel
(ngrok, Cloudflare Tunnel) or a deployed URL.

**Here:** `callbackUrl` is built from `NEXT_PUBLIC_BASE_URL`. The mock gateway
sidesteps this entirely for local dev.

**You own:** A public URL (tunnel/staging) before testing against real SabPaisa.

## 5. Never trust the amount (or status) from the client

**Pain:** If the client tells the server "charge ₹1", it charges ₹1. If the
client tells your app "payment succeeded", a forged request marks orders paid.

**Here:**
- `app/api/payment/initiate/route.ts` ignores any client amount and recomputes
  the total with `computeTotals()` (`lib/pricing.ts`) from the catalog.
- `app/api/payment/callback/route.ts` only marks an order paid when the gateway
  says `SUCCESS` **and** the paid amount matches the recorded order
  (`amount_mismatch` otherwise).

**You own:** Verifying the callback's authenticity (decryptable + signature if
SabPaisa provides one) so an attacker can't forge a success.

## 6. Idempotency & duplicate callbacks

**Pain:** Users double-click "Pay", refresh the callback page, or the gateway
retries its webhook. Without idempotency you create duplicate orders or
double-fulfil.

**Here:** Orders are keyed by `clientTxnId` in `lib/orders.ts`, so re-processing
the same id updates one record rather than creating new ones.

**You own:** Make state transitions idempotent in your real datastore (e.g.
"only pending → paid"), and dedupe webhook deliveries.

## 7. Redirect vs webhook race conditions

**Pain:** Most gateways notify you **twice**: a browser redirect *and* an async
server webhook. They can arrive in either order, and the browser one can be
lost (user closes the tab). Relying on only one loses payments.

**Here:** The redirect callback is implemented. The architecture (a pending
order reconciled by `clientTxnId`) is ready for a webhook to update the same
record.

**You own:** Add a server webhook endpoint and treat the webhook — not the
browser redirect — as the source of truth.

## 8. Pending / timeout / abandoned orders

**Pain:** A user starts paying and vanishes. The order is stuck `pending`
forever; you don't know if money moved.

**Here:** Orders start as `pending` (`lib/orders.ts`) and only become
`paid`/`failed` on a callback.

**You own:** A reconciliation job + the gateway's "transaction status / verify"
API to resolve stale pending orders.

## 9. Persistence (the in-memory store is a placeholder)

**Pain:** Serverless functions don't share memory and reset on cold start. An
in-memory order created during *initiate* may be gone by the *callback*.

**Here:** `lib/orders.ts` is intentionally an in-memory `Map`, loudly flagged.

**You own:** Replace it with a real datastore (Postgres, Redis, …) — the
function signatures can stay identical.

## 10. Test vs production environments

**Pain:** Separate credentials, separate gateway URLs, separate test cards.
Shipping UAT creds to prod (or vice-versa) is a classic outage.

**Here:** Everything is env-driven (`.env.example`); the UAT and prod gateway
URLs are both documented there.

**You own:** Separate `.env` per environment; never commit real secrets
(`.gitignore` already excludes `.env*` except the template).

## 11. Currency, rounding & decimals

**Pain:** Rupees vs paise, `.toFixed(2)` vs integers, floating-point drift on
totals — mismatches here cause `amount_mismatch` rejections or wrong charges.

**Here:** Prices are whole rupees; `lib/currency.ts` formats display with
`Intl`; the request sends `amount.toFixed(2)`.

**You own:** Confirm SabPaisa's expected unit/format and keep one rounding rule
everywhere.

## 12. PCI / never handle card data

**Pain:** Touching raw card numbers drags you into PCI-DSS scope.

**Here:** Payment details are collected on SabPaisa's hosted page; this app
never sees a card number. The checkout UI says so explicitly.

**You own:** Keep using the hosted page; don't add card fields to your form.

## 13. Failure UX (don't punish the customer)

**Pain:** Clearing the cart on a *failed* payment, or showing a blank error,
loses the sale.

**Here:** `app/checkout/result/page.tsx` clears the cart **only on success**;
failures keep the bag intact and offer a retry.

**You own:** Friendly ret/retry messaging, and handling every gateway status
(success, failed, aborted, pending).

---

## Still out of scope (deliberately)

Refunds, partial captures, saved cards / tokenization, subscriptions, multi-
currency, fraud checks, and signature verification on the callback. Each is its
own project — but the structure here (server-side pricing + a reconciled order
record) is the right foundation to build them on.
