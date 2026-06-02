"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-line/60">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between text-ink">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          ShopNext
        </Link>

        <nav className="hidden md:flex items-center gap-9 text-xs font-normal text-ink/80">
          <Link href="/" className="hover:text-ink transition-colors">
            Home
          </Link>
          <Link href="/products" className="hover:text-ink transition-colors">
            Store
          </Link>
          <Link href="/about" className="hover:text-ink transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          <button className="text-xs text-ink/80 hover:text-ink transition-colors">
            Sign in
          </button>
          <Link
            href="/cart"
            className="relative text-ink/80 hover:text-ink transition-colors"
            aria-label="Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand text-white text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
