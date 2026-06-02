"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const SHIPPING_THRESHOLD = 75;
const SHIPPING_COST = 9.99;

export default function CheckoutPage() {
  const { items, subtotal, totalItems, clearCart } = useCart();
  const [placed, setPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const shipping =
    subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Generate a fake order number and "place" the order.
    setOrderNumber(`SN-${Math.floor(100000 + Math.random() * 900000)}`);
    setPlaced(true);
    clearCart();
  };

  // Order confirmation
  if (placed) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-28 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-ink mb-2">
          Thank you for your order.
        </h1>
        <p className="text-ink-soft mb-1">
          Your order <span className="font-mono font-semibold text-ink">{orderNumber}</span>{" "}
          has been placed.
        </p>
        <p className="text-ink-soft mb-8">
          A confirmation email is on its way. (This is a demo — no real charge was
          made.)
        </p>
        <Link
          href="/products"
          className="inline-block bg-brand text-white font-normal px-6 py-2.5 rounded-full hover:bg-brand-hover transition-colors text-lg"
        >
          Continue shopping
        </Link>
      </section>
    );
  }

  // Empty cart guard
  if (items.length === 0) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-28 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-ink mb-3">
          Your bag is empty.
        </h1>
        <p className="text-lg text-ink-soft mb-8">
          Add some products before checking out.
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
      <h1 className="text-4xl font-semibold tracking-tight text-ink mb-12 text-center">
        Checkout.
      </h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        {/* Form fields */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <fieldset className="bg-haze rounded-2xl p-6">
            <legend className="px-2 text-lg font-semibold tracking-tight text-ink">
              Contact & Shipping
            </legend>
            <div className="grid sm:grid-cols-2 gap-4 mt-2">
              <Field label="Email" type="email" name="email" className="sm:col-span-2" />
              <Field label="First name" name="firstName" />
              <Field label="Last name" name="lastName" />
              <Field label="Address" name="address" className="sm:col-span-2" />
              <Field label="City" name="city" />
              <Field label="ZIP / Postal code" name="zip" />
            </div>
          </fieldset>

          <fieldset className="bg-haze rounded-2xl p-6">
            <legend className="px-2 text-lg font-semibold tracking-tight text-ink">
              Payment
            </legend>
            <div className="grid sm:grid-cols-2 gap-4 mt-2">
              <Field
                label="Card number"
                name="card"
                placeholder="4242 4242 4242 4242"
                className="sm:col-span-2"
              />
              <Field label="Expiry (MM/YY)" name="expiry" placeholder="12/28" />
              <Field label="CVC" name="cvc" placeholder="123" />
            </div>
            <p className="text-xs text-ink-soft mt-4">
              🔒 Demo checkout — do not enter real card details.
            </p>
          </fieldset>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-haze rounded-2xl p-6 sticky top-20">
            <h2 className="text-lg font-semibold tracking-tight text-ink mb-4">
              Order Summary{" "}
              <span className="text-sm font-normal text-ink-soft">
                ({totalItems})
              </span>
            </h2>

            <div className="flex flex-col gap-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-ink">
                    {item.name}{" "}
                    <span className="text-ink-soft">× {item.quantity}</span>
                  </span>
                  <span className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-4 flex flex-col gap-2 text-sm">
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
              <div className="border-t border-line mt-2 pt-2 flex justify-between text-base font-semibold text-ink">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full bg-brand text-white font-normal px-6 py-2.5 rounded-full hover:bg-brand-hover transition-colors"
            >
              Place order
            </button>
            <Link
              href="/cart"
              className="mt-3 block text-center text-sm text-brand hover:underline"
            >
              Back to bag
            </Link>
          </div>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        name={name}
        required
        placeholder={placeholder}
        className="rounded-xl border border-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
    </label>
  );
}
