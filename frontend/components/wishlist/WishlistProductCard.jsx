"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Badge from "@/components/ui/Badge";
import OptimizedImage from "@/components/ui/OptimizedImage";
import Button from "@/components/ui/Button";
import useCartStore from "@/store/cartStore";
import api from "@/utils/axios";

export default function WishlistProductCard({ product }) {
  const queryClient = useQueryClient();
  const addItem = useCartStore((s) => s.addItem);
  const [cartPulse, setCartPulse] = useState(false);

  const image = product?.images?.[0];
  const hasDiscount = product?.discountPrice !== undefined && product?.discountPrice !== null;

  const handleAddToCart = () => {
    addItem({
      product: product._id,
      title: product.title,
      image: image || "",
      price: hasDiscount ? product.discountPrice : product.price,
      quantity: 1,
      size: null,
      color: null,
    });
    toast.success("Added to cart");
    setCartPulse(true);
    window.setTimeout(() => setCartPulse(false), 1000);
  };

  const handleRemove = async () => {
    try {
      await api.delete(`/wishlist/${product._id}`);
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not remove");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative">
          <div className="relative aspect-square w-full bg-neutral-100">
            {image ? (
              <OptimizedImage
                src={image}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : null}
          </div>
          {hasDiscount ? (
            <div className="absolute left-3 top-3">
              <Badge variant="sale">SALE</Badge>
            </div>
          ) : null}
        </div>
        <div className="p-4">
          <h3 className="truncate text-sm font-medium text-primary">{product.title}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            {hasDiscount ? (
              <>
                <span className="text-sm font-semibold text-accent">৳{Number(product.discountPrice).toFixed(0)}</span>
                <span className="text-xs text-neutral-800/60 line-through">৳{Number(product.price).toFixed(0)}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-primary">৳{Number(product.price).toFixed(0)}</span>
            )}
          </div>
        </div>
      </Link>
      <div className="mt-auto grid gap-2 p-4 pt-0">
        <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleRemove}>
          Remove from Wishlist
        </Button>
        <Button
          type="button"
          className={`w-full ${cartPulse ? "!bg-amber-500 !hover:bg-amber-600" : ""}`}
          size="sm"
          onClick={handleAddToCart}
        >
          {cartPulse ? "Added to Cart" : "Add to Cart"}
        </Button>
      </div>
    </motion.div>
  );
}
