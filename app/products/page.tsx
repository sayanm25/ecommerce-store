"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/lib/products";

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-5xl font-semibold tracking-tight text-ink mb-2 text-center">
        Store.
      </h1>
      <p className="text-xl text-ink-soft mb-10 text-center">
        The best way to shop the products you love.
      </p>

      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-ink text-white"
                : "bg-haze text-ink hover:bg-line/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-ink-soft py-16">No products found in this category.</p>
      )}
    </section>
  );
}
