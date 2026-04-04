"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiOutlineHeart, HiStar, HiOutlineStar } from "react-icons/hi2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import OptimizedImage from "@/components/ui/OptimizedImage";
import useCartStore from "@/store/cartStore";
import useAuth from "@/hooks/useAuth";
import api from "@/utils/axios";

const clampRating = (v) => Math.max(0, Math.min(5, Number(v || 0)));

function Stars({ rating = 0 }) {
  const r = clampRating(rating);
  const filled = Math.round(r);
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${r} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) =>
        i < filled ? (
          <HiStar key={i} className="h-4 w-4 text-amber-500" />
        ) : (
          <HiOutlineStar key={i} className="h-4 w-4 text-neutral-800/40" />
        )
      )}
    </div>
  );
}

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [cartPulse, setCartPulse] = React.useState(false);

  const image = product?.images?.[0];
  const hasDiscount = product?.discountPrice !== undefined && product?.discountPrice !== null;

  const wishlistQuery = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await api.get("/wishlist");
      return res.data?.wishlist ?? [];
    },
    enabled: Boolean(accessToken),
  });

  const wishlisted =
    Boolean(product?._id) &&
    Array.isArray(wishlistQuery.data) &&
    wishlistQuery.data.some((p) => String(p._id) === String(product._id));

  const onToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product?._id) return;
    if (!accessToken) {
      router.push("/login");
      return;
    }

    (async () => {
      try {
        if (wishlisted) {
          await api.delete(`/wishlist/${product._id}`);
        } else {
          await api.post(`/wishlist/${product._id}`);
        }
        await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Wishlist update failed");
      }
    })();
  };

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
      className="group overflow-hidden rounded-2xl border bg-white transition duration-200"
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

          <div className="absolute left-3 top-3 flex items-center gap-2">
            {hasDiscount ? <Badge variant="sale">SALE</Badge> : null}
          </div>

          <button
            type="button"
            aria-label="Toggle wishlist"
            onClick={onToggleWishlist}
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition duration-200 hover:bg-neutral-900"
          >
            <HiOutlineHeart className={`h-5 w-5 ${wishlisted ? "text-amber-400" : "text-white"}`} />
          </button>
        </div>

        <div className="p-4">
          <h3 className="truncate text-sm font-medium text-primary">{product.title}</h3>

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-sm font-semibold text-accent">
                    ৳{Number(product.discountPrice).toFixed(0)}
                  </span>
                  <span className="text-xs text-neutral-800/60 line-through">
                    ৳{Number(product.price).toFixed(0)}
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-primary">
                  ৳{Number(product.price).toFixed(0)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Stars rating={product.ratings} />
              <span className="text-xs text-neutral-800/70">({product.numReviews || 0})</span>
            </div>
          </div>

          <div className="mt-3">
            <Button
              className={`w-full ${cartPulse ? "!bg-amber-500 !hover:bg-amber-600" : ""}`}
              size="sm"
              onClick={(e) => {
                // keep click inside Link from navigating
                e.preventDefault();
                e.stopPropagation();
                addItem({
                  product: product._id,
                  title: product.title,
                  image: image || "",
                  price: hasDiscount ? product.discountPrice : product.price,
                  quantity: 1,
                  size: null,
                  color: null,
                });
                setCartPulse(true);
                window.setTimeout(() => setCartPulse(false), 1000);
              }}
            >
              {cartPulse ? "Added to Cart" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
