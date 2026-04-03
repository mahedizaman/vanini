"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineHeart, HiStar, HiOutlineStar } from "react-icons/hi2";

import api from "@/utils/axios";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ReviewSection from "@/components/product/ReviewSection";
import Button from "@/components/ui/Button";
import useCartStore from "@/store/cartStore";

const fetchProduct = async (slug) => {
  // The route param may be either a slug or (in some cases) an id.
  // Prefer slug lookup, but fall back to id to avoid "Product not found".
  try {
    const res = await api.get(`/products/slug/${encodeURIComponent(slug)}`);
    return res.data?.data || res.data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404) {
      const res2 = await api.get(`/products/${encodeURIComponent(slug)}`);
      return res2.data?.data || res2.data;
    }
    throw err;
  }
};

const clampRating = (v) => Math.max(0, Math.min(5, Number(v || 0)));

function Stars({ rating = 0 }) {
  const r = clampRating(rating);
  const filled = Math.round(r);
  return (
    <div className="flex items-center gap-0.5">
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

export default function ProductSlugPage({ params }) {
  // Next.js may pass `params` as a Promise in some configurations.
  // Avoid reading `params.slug` synchronously to prevent the warning.
  const [slug, setSlug] = useState("");
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(params).then((p) => {
      if (cancelled) return;
      setSlug(p?.slug ? String(p.slug) : "");
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    enabled: Boolean(slug),
  });

  const product = productQuery.data;
  const sizes = product?.sizes || [];
  const colors = product?.colors || [];

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [qty, setQty] = useState(1);
  const [wish, setWish] = useState(false);

  const hasDiscount = product?.discountPrice !== undefined && product?.discountPrice !== null;
  const unitPrice = hasDiscount ? product?.discountPrice : product?.price;

  const breadcrumbCategory = product?.category?.name || "Shop";

  const canAdd = Boolean(product?._id) && (sizes.length ? Boolean(selectedSize) : true) && (colors.length ? Boolean(selectedColor) : true);

  const onAddToCart = () => {
    if (!canAdd) return;
    addItem({
      product: product._id,
      title: product.title,
      image: product.images?.[0] || "",
      price: unitPrice,
      quantity: qty,
      size: selectedSize || null,
      color: selectedColor || null,
    });
  };

  const description = product?.description || "";

  if (productQuery.isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-10">Loading...</div>;
  }

  if (!product) {
    return <div className="mx-auto max-w-6xl px-4 py-10">Product not found.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 text-sm text-neutral-800/70">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>{" "}
        &gt;{" "}
        <Link href="/shop" className="hover:text-primary">
          Shop
        </Link>{" "}
        &gt; <span>{breadcrumbCategory}</span> &gt; <span className="text-primary">{product.title}</span>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <ProductImageGallery images={product.images || []} />

        <div>
          <h1 className="font-display text-3xl font-bold text-primary">{product.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-800/70">
            {product.brand?.name ? <span>Brand: {product.brand.name}</span> : null}
            <div className="flex items-center gap-2">
              <Stars rating={product.ratings} />
              <span>({product.numReviews || 0})</span>
            </div>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="text-2xl font-bold text-accent">৳{Number(product.discountPrice).toFixed(0)}</span>
                <span className="text-sm text-neutral-800/60 line-through">৳{Number(product.price).toFixed(0)}</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-primary">৳{Number(product.price).toFixed(0)}</span>
            )}
          </div>

          {sizes.length ? (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-primary">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={[
                      "rounded-lg border px-3 py-2 text-sm transition",
                      selectedSize === s
                        ? "border-primary bg-primary text-white"
                        : "border-neutral-100 bg-white hover:bg-neutral-50",
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {colors.length ? (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-primary">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => {
                  const active = selectedColor === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={[
                        "h-9 w-9 rounded-full border transition",
                        active ? "ring-2 ring-primary ring-offset-2" : "hover:ring-2 hover:ring-primary/40 hover:ring-offset-2",
                      ].join(" ")}
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                      title={c}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-primary">Quantity</p>
            <div className="inline-flex items-center rounded-lg border border-neutral-100 bg-white">
              <button
                type="button"
                className="px-3 py-2 hover:bg-neutral-50"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <div className="min-w-12 text-center text-sm font-semibold">{qty}</div>
              <button
                type="button"
                className="px-3 py-2 hover:bg-neutral-50"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-7 flex items-center gap-3">
            <Button className="flex-1" disabled={!canAdd} onClick={onAddToCart}>
              Add to Cart
            </Button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-100 bg-white hover:bg-neutral-50"
              onClick={() => setWish((v) => !v)}
              aria-label="Add to Wishlist"
            >
              <HiOutlineHeart className={`h-6 w-6 ${wish ? "text-accent" : "text-primary"}`} />
            </button>
          </div>

          <div className="mt-8 rounded-2xl border bg-white p-5">
            <h3 className="text-sm font-semibold text-primary">Description</h3>
            <p className="mt-3 text-sm leading-6 text-neutral-800">{description}</p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <ReviewSection
          productId={product._id}
          reviews={product.reviews || []}
          ratings={product.ratings || 0}
          numReviews={product.numReviews || 0}
        />
      </div>
    </div>
  );
}

