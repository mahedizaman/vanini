import { Suspense } from "react";

import OrderDetailClient from "./OrderDetailClient";

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-24 text-center text-sm text-neutral-500">Loading…</div>
      }
    >
      <OrderDetailClient />
    </Suspense>
  );
}
