"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import PageWrapper from "@/components/layout/PageWrapper";
import RequireAuth from "@/components/auth/RequireAuth";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import api from "@/utils/axios";

function shortOrderId(id) {
  const s = String(id || "");
  return s.length > 8 ? s.slice(-8) : s;
}

function OrdersList() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", "my"],
    queryFn: async () => {
      const res = await api.get("/orders/my");
      return res.data?.data ?? [];
    },
  });

  if (isLoading) {
    return (
      <p className="text-sm text-neutral-600" aria-live="polite">
        Loading orders…
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-accent">Could not load orders.</p>;
  }

  if (!data?.length) {
    return (
      <div className="rounded-xl border border-neutral-100 bg-white p-10 text-center shadow-sm">
        <p className="text-neutral-700">You have no orders yet.</p>
        <Link href="/shop" className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((order) => {
              const itemCount = Array.isArray(order.items) ? order.items.length : 0;
              const qtySum = Array.isArray(order.items)
                ? order.items.reduce((n, line) => n + Number(line.quantity || 0), 0)
                : 0;
              return (
                <tr
                  key={order._id}
                  role="link"
                  tabIndex={0}
                  className="cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-50/80"
                  onClick={() => router.push(`/orders/${order._id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/orders/${order._id}`);
                    }
                  }}
                >
                  <td className="px-4 py-4">
                    <span className="font-medium text-primary underline-offset-2 hover:underline">
                      #{shortOrderId(order._id)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-neutral-700">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-4 text-neutral-700">
                    {itemCount} {itemCount === 1 ? "line" : "lines"}
                    {qtySum ? ` (${qtySum} pcs)` : ""}
                  </td>
                  <td className="px-4 py-4 tabular-nums font-medium text-primary">
                    ৳{Number(order.finalPrice ?? 0).toFixed(0)}
                  </td>
                  <td className="px-4 py-4">
                    <OrderStatusBadge status={order.orderStatus} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <RequireAuth>
      <PageWrapper>
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h1 className="font-display text-3xl font-semibold text-primary">Your orders</h1>
          <p className="mt-1 text-sm text-neutral-600">Track and view past purchases.</p>
          <div className="mt-8">
            <OrdersList />
          </div>
        </div>
      </PageWrapper>
    </RequireAuth>
  );
}
