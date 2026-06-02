export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  badge?: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Classic Leather Wallet",
    price: 49.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1627123424574-724758594913?w=400&q=80",
    rating: 4.5,
    reviewCount: 128,
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Wireless Noise-Cancelling Headphones",
    price: 199.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    rating: 4.8,
    reviewCount: 342,
    badge: "New",
  },
  {
    id: 3,
    name: "Minimalist Watch",
    price: 129.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    rating: 4.6,
    reviewCount: 89,
  },
  {
    id: 4,
    name: "Canvas Tote Bag",
    price: 34.99,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
    rating: 4.3,
    reviewCount: 215,
  },
  {
    id: 5,
    name: "Running Sneakers",
    price: 89.99,
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    rating: 4.7,
    reviewCount: 503,
    badge: "Sale",
  },
  {
    id: 6,
    name: "Ceramic Coffee Mug",
    price: 24.99,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80",
    rating: 4.4,
    reviewCount: 67,
  },
  {
    id: 7,
    name: "Portable Bluetooth Speaker",
    price: 79.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",
    rating: 4.5,
    reviewCount: 178,
  },
  {
    id: 8,
    name: "Linen Throw Pillow",
    price: 29.99,
    category: "Home",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&q=80",
    rating: 4.2,
    reviewCount: 44,
  },
];

export const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
