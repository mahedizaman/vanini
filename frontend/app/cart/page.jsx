"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { HiMinus, HiPlus, HiTrash } from "react-icons/hi2";

import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import OptimizedImage from "@/components/ui/OptimizedImage";
import useAuth from "@/hooks/useAuth";
import useCart from "@/hooks/useCart";
import { orderGrandTotal, shippingCharge } from "@/lib/orderTotals";
import api from "@/utils/axios";

export default function CartPage() {
  const { accessToken } = useAuth();
  const {
    items,
    updateQuantity,
    removeItem,
    total,
    couponCode,
    discountAmount,
    setCoupon,
    clearCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [applying, setApplying] = useState(false);

  const subtotal = total;
  const shipping = shippingCharge(subtotal, discountAmount);
  const grandTotal = orderGrandTotal(subtotal, discountAmount, shipping);

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      toast.error("Enter a coupon code");
      return;
    }
    if (!accessToken) {
      toast.error("Sign in to apply coupons");
      return;
    }

    setApplying(true);
    try {
      const { data } = await api.post("/coupons/apply", {
        code,
        orderTotal: subtotal,
      });
      if (data?.success && typeof data.discount === "number") {
        setCoupon(code, data.discount);
        toast.success("Coupon applied");
      } else {
        toast.error("Could not apply coupon");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid or expired coupon";
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  return (
    <PageWrapper>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold text-primary">Shopping cart</h1>
        <p className="mt-1 text-sm text-neutral-600">Review items before checkout.</p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-neutral-100 bg-white p-10 text-center shadow-sm">
            <p className="text-neutral-700">Your cart is empty.</p>
            <Link
              href="/shop"
              className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
            <div className="overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Size</th>
                      <th className="px-4 py-3 font-medium">Color</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Quantity</th>
                      <th className="px-4 py-3 font-medium text-right">Line</th>
                      <th className="w-12 px-2 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const line = Number(item.price || 0) * Number(item.quantity || 0);
                      return (
                        <tr key={`${item.product}-${item.size}-${item.color}-${idx}`} className="border-b border-neutral-100 last:border-0">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                                {item.image ? (
                                  <OptimizedImage src={item.image} alt="" width={64} height={64} className="object-cover" sizes="64px" />
                                ) : null}
                              </div>
                              <span className="font-medium text-primary">{item.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-neutral-700">{item.size || "—"}</td>
                          <td className="px-4 py-4 text-neutral-700">{item.color || "—"}</td>
                          <td className="px-4 py-4 tabular-nums text-neutral-800">৳{Number(item.price || 0).toFixed(0)}</td>
                          <td className="px-4 py-4">
                            <div className="inline-flex items-center rounded-md border border-neutral-200">
                              <button
                                type="button"
                                className="p-2 hover:bg-neutral-100 disabled:opacity-40"
                                aria-label="Decrease quantity"
                                disabled={Number(item.quantity || 1) <= 1}
                                onClick={() =>
                                  updateQuantity(item.product, item.size, item.color, Number(item.quantity || 1) - 1)
                                }
                              >
                                <HiMinus className="h-4 w-4" />
                              </button>
                              <span className="min-w-10 select-none text-center">{item.quantity}</span>
                              <button
                                type="button"
                                className="p-2 hover:bg-neutral-100"
                                aria-label="Increase quantity"
                                onClick={() =>
                                  updateQuantity(item.product, item.size, item.color, Number(item.quantity || 1) + 1)
                                }
                              >
                                <HiPlus className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right font-semibold tabular-nums text-primary">
                            ৳{line.toFixed(0)}
                          </td>
                          <td className="px-2 py-4">
                            <button
                              type="button"
                              className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100"
                              aria-label="Remove item"
                              onClick={() => removeItem(item.product, item.size, item.color)}
                            >
                              <HiTrash className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-primary">Order summary</h2>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-700">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums font-medium text-primary">৳{subtotal.toFixed(0)}</dd>
                </div>

                <div className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon code"
                      className="min-w-0 flex-1 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button type="button" variant="outline" size="md" isLoading={applying} onClick={applyCoupon}>
                      Apply
                    </Button>
                  </div>
                  {couponCode ? (
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-neutral-600">
                        <span className="font-medium text-primary">{couponCode}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums text-accent">−৳{discountAmount.toFixed(0)}</span>
                        <button
                          type="button"
                          className="text-xs text-neutral-500 underline"
                          onClick={() => {
                            clearCoupon();
                            setCouponInput("");
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex justify-between border-t border-neutral-100 pt-2 text-neutral-700">
                  <dt>Shipping</dt>
                  <dd className="tabular-nums font-medium text-primary">
                    {shipping === 0 ? "Free" : `৳${shipping}`}
                  </dd>
                </div>

                <div className="flex justify-between border-t border-neutral-100 pt-3 text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums text-primary">৳{grandTotal.toFixed(0)}</dd>
                </div>
              </dl>

              <p className="mt-1 text-xs text-neutral-500">
                Free shipping on orders over ৳999 (after discount).
              </p>

              <Link href="/checkout" className="mt-6 block">
                <Button className="w-full bg-accent hover:bg-accent-hover" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link
                href="/shop"
                className="mt-4 block text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
