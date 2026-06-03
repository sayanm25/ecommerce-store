"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/currency";

const SHIPPING_THRESHOLD = 4999;
const SHIPPING_COST = 199;

/** Auto-submit a hidden POST form to the payment gateway. */
function postToGateway(url: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutPage() {
  const { items, subtotal, totalItems, clearCart } = useCart();
  const [placed, setPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const shipping =
    subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setProcessing(true);

    const fd = new FormData(e.currentTarget);
    const name = `${fd.get("firstName") ?? ""} ${fd.get("lastName") ?? ""}`.trim();
    const email = String(fd.get("email") ?? "");
    const mobile = String(fd.get("phone") ?? "");

    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, name, email, mobile }),
      });

      // Gateway not configured yet → demo confirmation fallback.
      if (res.status === 503) {
        setOrderNumber(`SN-${Math.floor(100000 + Math.random() * 900000)}`);
        setPlaced(true);
        clearCart();
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message || data.error || "Could not start the payment."
        );
      }

      const { gatewayUrl, clientCode, encData } = await res.json();
      // Hand off to SabPaisa's hosted page. Field names per SabPaisa kit.
      postToGateway(gatewayUrl, { clientCode, encData });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setProcessing(false);
    }
  };

  // Demo confirmation (shown only when the gateway isn't configured)
  if (placed) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-28 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-ink mb-2">
          Thank you for your order.
        </h1>
        <p className="text-ink-soft mb-1">
          Your order{" "}
          <span className="font-mono font-semibold text-ink">{orderNumber}</span>{" "}
          has been placed.
        </p>
        <p className="text-ink-soft mb-8">
          (Demo mode — SabPaisa is not configured, so no real payment was taken.)
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
              <Field label="Phone" type="tel" name="phone" />
              <Field label="ZIP / Postal code" name="zip" />
              <Field label="Address" name="address" className="sm:col-span-2" />
              <Field label="City" name="city" />
            </div>
          </fieldset>

          <fieldset className="bg-haze rounded-2xl p-6">
            <legend className="px-2 text-lg font-semibold tracking-tight text-ink">
              Payment
            </legend>
            <p className="text-sm text-ink-soft mt-2">
              🔒 You&apos;ll be securely redirected to <strong>SabPaisa</strong> to
              complete your payment (UPI, cards, net banking). We never see or
              store your card details.
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
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              <div className="border-t border-line mt-2 pt-2 flex justify-between text-base font-semibold text-ink">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={processing}
              className="mt-6 w-full bg-brand text-white font-normal px-6 py-2.5 rounded-full hover:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {processing ? "Processing…" : `Pay ${formatPrice(total)}`}
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
