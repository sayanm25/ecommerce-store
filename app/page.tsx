import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import Link from "next/link";

export default function Home() {
  const featured = products.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="bg-gray-50 py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
            Everything you need,<br />
            <span className="text-gray-500">nothing you don&apos;t.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10">
            Discover our curated collection of premium products. Quality guaranteed, shipped fast.
          </p>
          <Link
            href="/products"
            className="inline-block bg-gray-900 text-white font-semibold px-8 py-4 rounded-full hover:bg-gray-700 transition-colors"
          >
            Shop all products
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured products</h2>
          <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <section className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Free shipping on orders over $75</h2>
          <p className="text-gray-400 mb-8">
            Use code{" "}
            <span className="font-mono bg-gray-800 px-2 py-1 rounded text-white">FREESHIP</span>{" "}
            at checkout
          </p>
          <Link
            href="/products"
            className="inline-block border border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-gray-900 transition-colors"
          >
            Start shopping
          </Link>
        </div>
      </section>
    </>
  );
}
