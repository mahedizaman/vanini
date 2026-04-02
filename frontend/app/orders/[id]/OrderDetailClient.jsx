"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import PageWrapper from "@/components/layout/PageWrapper";
import RequireAuth from "@/components/auth/RequireAuth";
import Button from "@/components/ui/Button";
import OptimizedImage from "@/components/ui/OptimizedImage";
import Skeleton from "@/components/ui/Skeleton";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import useCartStore from "@/store/cartStore";
import api from "@/utils/axios";

function shortOrderId(id) {
  const s = String(id || "");
  return s.length > 8 ? s.slice(-8) : s;
}

function PaymentStatusBadge({ status }) {
  const key = String(status || "").toLowerCase();
  const map = {
    paid: "bg-green-100 text-green-900",
    pending: "bg-amber-100 text-amber-900",
    failed: "bg-red-100 text-red-900",
  };
  const cls = map[key] || "bg-neutral-100 text-neutral-800";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {status || "—"}
    </span>
  );
}

function OrderBody() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id;
  const success = searchParams.get("status") === "success";
  const clearedCartRef = useRef(false);

  useEffect(() => {
    if (success && !clearedCartRef.current) {
      clearedCartRef.current = true;
      useCartStore.getState().clearCart();
    }
  }, [success]);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["orders", "my", id],
    queryFn: async () => {
      const res = await api.get(`/orders/my/${id}`);
      return res.data?.data;
    },
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (!error) return;
    const msg = error?.response?.data?.message || "Could not load order";
    toast.error(msg, { id: `order-err-${id}` });
  }, [error, id]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="rounded-xl border border-neutral-100 bg-white p-6">
          <Skeleton className="h-6 w-full max-w-md" />
          <Skeleton className="mt-4 h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return <p className="text-sm text-accent">Order not found.</p>;
  }

  const subtotal = Number(order.totalPrice ?? 0);
  const discount = Number(order.discountAmount ?? 0);
  const shipping = Number(order.shippingCharge ?? 0);
  const total = Number(order.finalPrice ?? 0);

  return (
    <>
      {success ? (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          Thank you — your order was placed successfully.
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-primary">Order #{shortOrderId(order._id)}</h2>
              <p className="mt-1 text-sm text-neutral-600">
                {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
              </p>
            </div>
            <OrderStatusBadge status={order.orderStatus} />
          </div>
        </div>

        <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-primary">Items</h3>
          <ul className="mt-4 space-y-4">
            {(order.items || []).map((line, i) => (
              <li key={i} className="flex gap-4 border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {line.image ? (
                    <OptimizedImage src={line.image} alt="" width={80} height={80} className="object-cover" sizes="80px" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-primary">{line.title}</p>
                  <p className="mt-1 text-xs text-neutral-600">
                    {[line.size && `Size: ${line.size}`, line.color && `Color: ${line.color}`].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-2 text-sm text-neutral-800">
                    ৳{Number(line.price).toFixed(0)} × {line.quantity}
                  </p>
                </div>
                <p className="shrink-0 tabular-nums font-semibold text-primary">
                  ৳{(Number(line.price) * Number(line.quantity)).toFixed(0)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-primary">Shipping address</h3>
          <p className="mt-3 text-sm text-neutral-800">
            {order.shippingAddress?.fullName}
            <br />
            {order.shippingAddress?.phone}
            <br />
            {[order.shippingAddress?.street, order.shippingAddress?.city, order.shippingAddress?.district, order.shippingAddress?.postalCode]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-primary">Payment</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-neutral-600">Method</dt>
              <dd className="font-medium text-primary">{order.paymentMethod || "—"}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-neutral-600">Status</dt>
              <dd>
                <PaymentStatusBadge status={order.paymentStatus} />
              </dd>
            </div>
            {order.paymentStatus === "paid" && order.transactionId ? (
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-neutral-600">Transaction ID</dt>
                <dd className="font-mono text-xs text-neutral-800">{order.transactionId}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        {order.trackingNumber ? (
          <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-primary">Tracking</h3>
            <p className="mt-2 font-mono text-sm text-neutral-800">{order.trackingNumber}</p>
          </div>
        ) : null}

        <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-primary">Price breakdown</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-600">Subtotal</dt>
              <dd className="tabular-nums">৳{subtotal.toFixed(0)}</dd>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between text-accent">
                <dt>Discount</dt>
                <dd className="tabular-nums">−৳{discount.toFixed(0)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-neutral-600">Shipping</dt>
              <dd className="tabular-nums">{shipping === 0 ? "Free" : `৳${shipping.toFixed(0)}`}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-3 text-base font-semibold text-primary">
              <dt>Total</dt>
              <dd className="tabular-nums">৳{total.toFixed(0)}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/orders">
            <Button type="button" variant="outline">
              All orders
            </Button>
          </Link>
          <Link href="/shop">
            <Button type="button" className="bg-accent hover:bg-accent-hover">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default function OrderDetailClient() {
  return (
    <RequireAuth>
      <PageWrapper>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <OrderBody />
        </div>
      </PageWrapper>
    </RequireAuth>
  );
}
