"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

function ResultContent() {
  const params = useSearchParams();
  const status = params.get("status"); // success | failed | error
  const txn = params.get("txn");
  const gatewayStatus = params.get("gateway_status");
  const reason = params.get("reason");
  const { clearCart } = useCart();

  // Clear the cart only once a payment has succeeded.
  useEffect(() => {
    if (status === "success") clearCart();
  }, [status, clearCart]);

  const success = status === "success";

  return (
    <section className="max-w-2xl mx-auto px-6 py-28 text-center">
      <div
        className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
          success ? "bg-green-100" : "bg-red-100"
        }`}
      >
        {success ? (
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      <h1 className="text-4xl font-semibold tracking-tight text-ink mb-2">
        {success ? "Payment successful." : "Payment not completed."}
      </h1>

      {success ? (
        <p className="text-ink-soft mb-1">
          Your transaction{" "}
          <span className="font-mono font-semibold text-ink">{txn}</span> is
          confirmed.
        </p>
      ) : (
        <p className="text-ink-soft mb-1">
          {reason
            ? `We couldn't process the payment (${reason}).`
            : `The gateway reported: ${gatewayStatus || "unknown"}.`}
        </p>
      )}

      <p className="text-ink-soft mb-8">
        {success
          ? "A confirmation email is on its way."
          : "No charge was made. You can try again from your bag."}
      </p>

      <div className="flex items-center justify-center gap-4">
        <Link
          href="/products"
          className="inline-block bg-brand text-white font-normal px-6 py-2.5 rounded-full hover:bg-brand-hover transition-colors text-lg"
        >
          Continue shopping
        </Link>
        {!success && (
          <Link href="/cart" className="text-brand hover:underline text-lg">
            Back to bag ›
          </Link>
        )}
      </div>
    </section>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <section className="max-w-2xl mx-auto px-6 py-28 text-center text-ink-soft">
          Loading…
        </section>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
