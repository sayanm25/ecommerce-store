"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const SHIPPING_THRESHOLD = 75;
const SHIPPING_COST = 9.99;

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCart();

  const shipping =
    subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-28 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-ink mb-3">
          Your bag is empty.
        </h1>
        <p className="text-lg text-ink-soft mb-8">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/products"
          className="inline-block bg-brand text-white font-normal px-6 py-2.5 rounded-full hover:bg-brand-hover transition-colors text-lg"
        >
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight text-ink mb-1 text-center">
        Your bag.
      </h1>
      <p className="text-center text-ink-soft mb-12">
        {totalItems} {totalItems === 1 ? "item" : "items"}
      </p>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Line items */}
        <div className="lg:col-span-2 flex flex-col divide-y divide-line border-y border-line">
          {items.map((item) => (
            <div key={item.id} className="flex gap-5 py-6">
              <div className="relative h-28 w-28 flex-shrink-0 rounded-2xl overflow-hidden bg-haze">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="text-xs text-ink-soft uppercase tracking-wide">
                      {item.category}
                    </p>
                    <h3 className="font-semibold tracking-tight text-ink">
                      {item.name}
                    </h3>
                  </div>
                  <p className="font-medium text-ink">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-line rounded-full">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 text-ink-soft hover:text-ink"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 text-ink-soft hover:text-ink"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-brand hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-haze rounded-2xl p-6 sticky top-20">
            <h2 className="text-lg font-semibold tracking-tight text-ink mb-4">
              Order Summary
            </h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-ink-soft">
                  Add ${(SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free
                  shipping.
                </p>
              )}
              <div className="border-t border-line mt-2 pt-2 flex justify-between text-base font-semibold text-ink">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block text-center bg-brand text-white font-normal px-6 py-2.5 rounded-full hover:bg-brand-hover transition-colors"
            >
              Check out
            </Link>
            <Link
              href="/products"
              className="mt-3 block text-center text-sm text-brand hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
