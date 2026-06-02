"use client";

import Image from "next/image";
import { useState } from "react";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

const badgeColors: Record<string, string> = {
  "Best Seller": "bg-amber-100 text-amber-800",
  New: "bg-blue-100 text-blue-800",
  Sale: "bg-red-100 text-red-800",
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
    <div className="group relative flex flex-col rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {product.badge && (
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${badgeColors[product.badge]}`}>
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</p>
        <h3 className="font-semibold text-gray-900 leading-snug">{product.name}</h3>

        <div className="flex items-center gap-1 mt-1">
          <div className="flex text-amber-400 text-sm">
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAdd}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
              added
                ? "bg-green-600 text-white"
                : "bg-gray-900 text-white hover:bg-gray-700"
            }`}
          >
            {added ? "Added ✓" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
