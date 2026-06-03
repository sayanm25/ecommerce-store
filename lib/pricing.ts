import { products } from "./products";

/** Shipping rules — the single source of truth for cart, checkout, and server. */
export const SHIPPING_THRESHOLD = 4999; // free shipping at/above this (₹)
export const SHIPPING_COST = 199; // flat shipping below the threshold (₹)

export interface CartLine {
  id: number;
  quantity: number;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  total: number;
}

export function shippingFor(subtotal: number): number {
  return subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

/**
 * Authoritative total calculation. Prices are looked up from the product
 * catalog by id — NEVER trust a price or total sent by the client.
 *
 * Throws if a line references an unknown product id.
 */
export function computeTotals(lines: CartLine[]): OrderTotals {
  let subtotal = 0;
  for (const line of lines) {
    if (!line || line.quantity <= 0) continue;
    const product = products.find((p) => p.id === line.id);
    if (!product) {
      throw new Error(`Unknown product id: ${line.id}`);
    }
    subtotal += product.price * line.quantity;
  }
  const shipping = shippingFor(subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
}
