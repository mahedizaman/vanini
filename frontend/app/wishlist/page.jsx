"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import PageWrapper from "@/components/layout/PageWrapper";
import RequireAuth from "@/components/auth/RequireAuth";
import ProductGrid from "@/components/product/ProductGrid";
import WishlistProductCard from "@/components/wishlist/WishlistProductCard";
import api from "@/utils/axios";

function WishlistContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await api.get("/wishlist");
      return res.data?.wishlist ?? [];
    },
  });

  useEffect(() => {
    if (!error) return;
    toast.error(error?.response?.data?.message || "Could not load wishlist", { id: "wishlist-err" });
  }, [error]);

  if (error) {
    return <p className="text-sm text-accent">Could not load wishlist.</p>;
  }

  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className="rounded-xl border border-neutral-100 bg-white p-10 text-center shadow-sm">
        <p className="text-neutral-700">Your wishlist is empty.</p>
        <Link href="/shop" className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <ProductGrid
      products={data || []}
      isLoading={isLoading}
      renderProduct={(product) => <WishlistProductCard product={product} />}
    />
  );
}

export default function WishlistPage() {
  return (
    <RequireAuth>
      <PageWrapper>
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h1 className="font-display text-3xl font-semibold text-primary">Wishlist</h1>
          <p className="mt-1 text-sm text-neutral-600">Saved products you love.</p>
          <div className="mt-8">
            <WishlistContent />
          </div>
        </div>
      </PageWrapper>
    </RequireAuth>
  );
}
