import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/lib/cart-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopNext",
  description: "A modern ecommerce store built with Next.js and Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-ink">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-haze border-t border-line py-8 text-center text-xs text-ink-soft">
            Copyright © 2026 ShopNext Inc. All rights reserved.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
