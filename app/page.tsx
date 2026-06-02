import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import Link from "next/link";

export default function Home() {
  const featured = products.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="bg-haze py-24 px-6 text-center">
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-ink">
          ShopNext.
        </h1>
        <p className="mt-3 text-xl sm:text-2xl font-medium text-ink-soft">
          Everything you need. Nothing you don&apos;t.
        </p>
        <div className="mt-7 flex items-center justify-center gap-6 text-lg">
          <Link
            href="/products"
            className="inline-block bg-brand text-white font-normal px-6 py-2.5 rounded-full hover:bg-brand-hover transition-colors"
          >
            Shop all products
          </Link>
          <Link
            href="/products"
            className="text-brand hover:underline"
          >
            Learn more ›
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Featured.
          </h2>
          <Link href="/products" className="text-brand hover:underline text-lg">
            View all ›
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <section className="bg-haze py-20 px-6 text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-ink mb-3">
          Free shipping on orders over $75.
        </h2>
        <p className="text-xl text-ink-soft mb-7">
          Use code{" "}
          <span className="font-medium text-ink">FREESHIP</span> at checkout.
        </p>
        <Link
          href="/products"
          className="inline-block bg-brand text-white font-normal px-6 py-2.5 rounded-full hover:bg-brand-hover transition-colors text-lg"
        >
          Start shopping
        </Link>
      </section>
    </>
  );
}
