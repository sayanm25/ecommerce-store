"use client";

import Image from "next/image";
import { useState } from "react";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/currency";

const badgeColors: Record<string, string> = {
  "Best Seller": "bg-orange-500 text-white",
  New: "bg-brand text-white",
  Sale: "bg-red-500 text-white",
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group relative flex flex-col rounded-2xl bg-haze overflow-hidden transition-shadow duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {product.badge && (
          <span className={`absolute top-3 left-3 text-[11px] font-medium px-2.5 py-1 rounded-full ${badgeColors[product.badge]}`}>
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 p-5 text-center">
        <p className="text-xs font-medium text-ink-soft uppercase tracking-wide">
          {product.category}
        </p>
        <h3 className="text-lg font-semibold tracking-tight text-ink leading-snug">
          {product.name}
        </h3>

        <div className="flex items-center justify-center gap-1 mt-1">
          <span className="text-orange-400 text-sm">
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))}
          </span>
          <span className="text-xs text-ink-soft">({product.reviewCount})</span>
        </div>

        <p className="text-base font-medium text-ink mt-2">
          {formatPrice(product.price)}
        </p>

        <button
          onClick={handleAdd}
          className={`mt-3 text-sm font-normal px-5 py-2 rounded-full transition-colors ${
            added
              ? "bg-green-600 text-white"
              : "bg-brand text-white hover:bg-brand-hover"
          }`}
        >
          {added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
