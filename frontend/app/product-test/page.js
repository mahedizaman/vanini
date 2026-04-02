"use client";

import ProductCard from "@/components/product/ProductCard";
import ProductImageGallery from "@/components/product/ProductImageGallery";

const sample = {
  _id: "p1",
  title: "Premium Cotton T-Shirt — Black",
  slug: "premium-cotton-t-shirt-black",
  images: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520975958225-ff4c1f4f6a16?auto=format&fit=crop&w=800&q=80",
  ],
  price: 1200,
  discountPrice: 899,
  ratings: 4.2,
  numReviews: 18,
};

export default function ProductTestPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Product Components Test</h1>
        <p className="mt-2 text-sm text-neutral-800">
          ProductCard + ProductImageGallery sample render.
        </p>
        <div className="mt-6 max-w-sm">
          <ProductCard product={sample} />
        </div>
      </div>

      <div>
        <ProductImageGallery images={sample.images} />
      </div>
    </div>
  );
}

