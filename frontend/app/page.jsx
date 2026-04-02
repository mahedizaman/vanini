"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import OptimizedImage from "@/components/ui/OptimizedImage";
import ProductGrid from "@/components/product/ProductGrid";
import api from "@/utils/axios";
import { fadeIn } from "@/animations/fadeIn";
import { slideUp } from "@/animations/slideUp";
import { staggerContainer, staggerItem } from "@/animations/stagger";

const fetchCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};

const fetchFeaturedProducts = async () => {
  const res = await api.get("/products", { params: { isFeatured: true, limit: 8 } });
  return res.data?.data || res.data;
};

export default function HomePage() {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const featuredProductsQuery = useQuery({
    queryKey: ["products", "featured", 8],
    queryFn: fetchFeaturedProducts,
  });

  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const featuredProducts = Array.isArray(featuredProductsQuery.data) ? featuredProductsQuery.data : [];

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center bg-[#111111] text-white">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/0 via-white/0 to-black/40" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-2xl">
            <motion.h1
              variants={slideUp}
              className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl"
            >
              Discover Your Style
            </motion.h1>
            <motion.p variants={fadeIn} className="mt-5 text-base text-white/80 sm:text-lg">
              Curated essentials and standout pieces—crafted for everyday confidence.
            </motion.p>
            <motion.div variants={staggerItem} className="mt-8">
              <Link href="/shop">
                <Button className="bg-accent hover:bg-accent-hover">Shop Now</Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-primary">Shop by Category</h2>
          <Link href="/shop" className="text-sm font-medium text-primary/70 hover:text-primary">
            View all
          </Link>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {categoriesQuery.isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <motion.div key={i} variants={staggerItem} className="aspect-4/3 rounded-2xl bg-neutral-100" />
              ))
            : categories.map((c) => (
                <motion.div key={c._id || c.slug} variants={staggerItem}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(c.slug)}`}
                    className="group block overflow-hidden rounded-2xl border bg-white"
                  >
                    <div className="relative aspect-4/3 w-full bg-neutral-100">
                      {c.image ? (
                        <OptimizedImage
                          src={c.image}
                          alt={c.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : null}
                    </div>
                    <div className="p-4">
                      <p className="truncate text-sm font-semibold text-primary group-hover:text-primary-light">
                        {c.name}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-primary">Featured Products</h2>
          <Link href="/shop" className="text-sm font-medium text-primary/70 hover:text-primary">
            Shop more
          </Link>
        </div>

        <ProductGrid products={featuredProducts} isLoading={featuredProductsQuery.isLoading} />
      </section>

      {/* Simple Banner */}
      <section className="bg-[#111111] py-10 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between gap-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-6">
            <p className="font-display text-lg font-semibold">Free Shipping on Orders Over ৳999</p>
            <Link href="/shop">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black cursor-pointer">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

