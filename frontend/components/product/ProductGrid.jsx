"use client";

import ProductCard from "@/components/product/ProductCard";

import { motion } from "framer-motion";

import Skeleton from "@/components/ui/Skeleton";
import { staggerContainer, staggerItem } from "@/animations/stagger";

export default function ProductGrid({ products = [], isLoading = false, renderProduct }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border bg-white">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4">
              <Skeleton className="h-4 w-3/4" />
              <div className="mt-3 flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="mt-4 h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-6 lg:grid-cols-4"
    >
      {products.map((product) => (
        <motion.div key={product._id || product.slug} variants={staggerItem}>
          {typeof renderProduct === "function" ? renderProduct(product) : <ProductCard product={product} />}
        </motion.div>
      ))}
    </motion.div>
  );
}
